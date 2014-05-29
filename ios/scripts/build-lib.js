var xcode = require('xcode'),
    fs = require('fs'),
    path = require('path'),
    os = require('os'),
    child_process = require('child_process'),
    shell = require('./shell');

var platformProjPath = path.resolve(path.join(__dirname, '..', '..')),
    xcodeProj,
    emulator = (process.argv[2] == '1');
fs.readdirSync(platformProjPath).every(function(f) {
    if(/\.xcodeproj$/i.test(f)) {
        xcodeProj = path.join(platformProjPath, f);
        return false;
    }
    return true;
});

var pbxFile = path.join(xcodeProj, 'project.pbxproj'),
    projectMainDir = xcodeProj.split(path.extname(xcodeProj))[0],
    backupPbx = pbxFile + '_backup';
var preparationFolder = path.join(platformProjPath, 'build', 'xFaceSDK');
var readmePath = path.join(preparationFolder, 'readme.txt');

if(fs.existsSync(backupPbx)) {
    shell.cp('-f', backupPbx, pbxFile);
} else {
    shell.cp('-f', pbxFile, backupPbx);
}
var pbx = new xcode.project(pbxFile);
pbx.parseSync();

var target = modifyTarget(pbx);
modifyFileRefence(pbx, target.productUuid);
modifyProductsGroup(pbx, target.productUuid);
modifyBuildConfiguration(pbx);

var pluginLibs = findPluginLibrary(path.join(projectMainDir, 'Plugins')); // absolate path
// remove static library reference from project, except custom framework
// if not, static library will be packed into the final lib, but framework will not
pluginLibs.forEach(function(lib) {
    path.extname(lib.toLowerCase()) == '.a' && pbx.removeFramework(lib, {customeFramework: true});
});
removeEntrySourceFile(pbx);

var targets = pbx.hash.project.objects['PBXProject'][pbx.hash.project.rootObject]['targets'];
targets.every(function(t) {
    if(t.value == target.targetUuid) {
        t.comment = 'xFaceLibAll';
        return false;
    }
    return true;
});

fs.writeFileSync(pbxFile, pbx.writeSync(), 'utf-8');

console.log('Begin to build library "libxFaceLibAll.a", please wait.....');
var buildCmd,
    buildCategoryName;
if(emulator) {
    buildCmd = 'xcodebuild clean -project "' + xcodeProj + '" -arch i386 -target xFaceLibAll -configuration'
        + ' Release -sdk iphonesimulator build VALID_ARCHS="i386" CONFIGURATION_BUILD_DIR="' + path.resolve(platformProjPath, 'build', 'emulator') + '" > /dev/null';
    buildCategoryName = 'emulator';
} else {
    buildCmd = 'xcodebuild clean -project "' + xcodeProj + '" -target xFaceLibAll -configuration'
        + ' Release -sdk iphoneos build CONFIGURATION_BUILD_DIR="' + path.resolve(platformProjPath, 'build', 'device') + '" > /dev/null';
    buildCategoryName = 'device';
}
// 这里使用child_process#exec而不是child_process#spawn，是因为使用spawn不能正常构建出静态库，原因没有搞清楚
child_process.exec(buildCmd,
    function(err, stdout, stderr) {
        stdout && console.log(stdout);
        stderr && console.error(stderr);

        shell.mv('-f', backupPbx, pbxFile);

        if(err) throw err;
        else {
            console.log('Build library "libxFaceLibAll.a" successful.');
            prepareArchiveSource(pbx);

            var cwd = process.cwd(),
                zipPath = path.join(platformProjPath, 'build', 'xfaceSDK.zip');
            shell.cd(preparationFolder);

            if(fs.existsSync(zipPath)) {
                shell.rm('-f', zipPath);
            }
            shell.exec('zip -r "' + zipPath + '" ' + '*');
            shell.cd(cwd);
        }
    }
);

function prepareArchiveSource(pbx) {
    if(fs.existsSync(preparationFolder)) {
        shell.rm('-rf', preparationFolder);
    }
    shell.mkdir('-p', preparationFolder);
    var libFolder = path.join(preparationFolder, 'lib');
    shell.mkdir(libFolder);

    var srcDir = path.join(platformProjPath, 'xfaceSdk');
    var itemsToCopy = fs.readdirSync(srcDir).filter(function(f) {
        return f != 'scripts';
    });

    console.log('Copy all static libraries...');
    shell.cp('-f', path.join(platformProjPath, 'build', buildCategoryName, 'libxFaceLibAll.a'), libFolder);
    pluginLibs.forEach(function(lib) {
        shell.cp('-rf', lib, libFolder);
    });

    console.log('Copy header files....');
    copyHeaderFiles(pbx, libFolder);

    console.log('Copy resource files....');
    shell.cp('-rf', path.join(projectMainDir, 'Resources'), libFolder);
    console.log('Copy demo and other files....');

    console.log('Copy application....');
    shell.cp('-rf', path.resolve(projectMainDir, '../xface3'), libFolder);

    // copy all files under xfaceSdk folder exclude 'scripts'
    itemsToCopy.forEach(function(f) {
        shell.cp('-rf', path.join(srcDir, f), preparationFolder);
    });

    // copy config.xml
    shell.cp('-f', path.join(projectMainDir, 'config.xml'), libFolder);

    // generate merged xface.js
    shell.exec('xmen build ios --merge-js -o "' + path.join(libFolder, 'xface.js') + '"');

    // TODO: 写入framework时，加上weak信息
    // write system framework requirement to readme
    var frameworks = collectSystemFrameworks(pbx),
        content = '\nSystem Framework Requirement: \n';
    frameworks.forEach(function(framework) {
        content += ('    ' + framework + '\n');
    });
    fs.appendFileSync(readmePath, content, 'utf-8');
}

function copyHeaderFiles(pbx, destLibFolder) {
    var xfaceSrcHeaderPath = path.join(platformProjPath, 'build', buildCategoryName, 'include', 'xFace'),
        cordovaSrcHeaderPath = path.join(platformProjPath, 'build', buildCategoryName, 'include', 'Cordova');
        destHeaderPath = path.join(destLibFolder, 'inc');
    if(!fs.existsSync(xfaceSrcHeaderPath)) {
        throw new Error('Can\'t find header folder "' + xfaceSrcHeaderPath + '".');
    }
    if(!fs.existsSync(cordovaSrcHeaderPath)) {
        throw new Error('Can\'t find header folder "' + cordovaSrcHeaderPath + '".');
    }
    shell.mkdir(destHeaderPath);
    shell.cp('-rf', path.join(xfaceSrcHeaderPath, '*'), destHeaderPath);
    shell.cp('-rf', path.join(cordovaSrcHeaderPath, '*'), path.join(destHeaderPath, 'Cordova'));
}

// modify pbx native target, then return target info
function modifyTarget(pbx) {
    var section = pbx.hash.project.objects['PBXNativeTarget'],
        targetUuid;

    for(key in section) {
        if(!/_comment$/.test(key) && section[key]['productType'] == '"com.apple.product-type.application"') {
            targetUuid = key;
        }
    }
    if(!targetUuid) {
        throw new Error('Can\'t find native target of application.');
    }
    section[targetUuid + '_comment'] = 'xFaceLibAll';
    var targetObj = section[targetUuid],
        buildPhases = targetObj['buildPhases'];
    // remove Resources build phase
    buildPhases.every(function(phase) {
        if(phase['comment'] == 'Resources' || /^Copy.*directory.*/i.test(phase['comment'])) {
            buildPhases.splice(buildPhases.indexOf(phase), 1);
        }
        return true;
    });
    targetObj['name'] = '"xFaceLibAll"';
    targetObj['productName'] = '"xFaceLibAll"';
    targetObj['productReference_comment'] = 'libxFaceLibAll.a';
    targetObj['productType'] = '"com.apple.product-type.library.static"';
    var target = {};
    target.productUuid = targetObj['productReference'];
    target.targetUuid = targetUuid;
    return target;
}

// modify file reference of product file
function modifyFileRefence(pbx, uuid) {
    var section = pbx.pbxFileReferenceSection();
    section[uuid + '_comment'] = 'libxFaceLibAll.a';
    section[uuid]['explicitFileType'] = 'archive.ar';
    section[uuid]['path'] = '"libxFaceLibAll.a"';
}

// modify group "Products"
function modifyProductsGroup(pbx, uuid) {
    var section = pbx.pbxGroupByName('Products'),
        children = section['children'];
    children.every(function(product) {
        if(product['value'] == uuid) {
            product['comment'] = 'libxFaceLibAll.a';
            return false;
        }
        return true;
    });
}

function modifyBuildConfiguration(pbx) {
    var config = pbx.hash.project.objects['XCBuildConfiguration'];
    Object.keys(config).forEach(function(key) {
        if(!/_comment$/.test(key)) {
            var settings = config[key]['buildSettings'];
            settings['OTHER_LDFLAGS'] = '"$(inherited)"';
            if(settings['PRODUCT_NAME']) {
                settings['PRODUCT_NAME'] = '"xFaceLibAll"';
            }
        }
    });
}

function findPluginLibrary(dir) {
    if(!fs.existsSync(dir)) {
        return [];
    }
    var libs = [];
    fs.readdirSync(dir).forEach(function(f) {
        var ext = path.extname(f).toLowerCase(),
            subPath = path.join(dir, f);
        if(fs.lstatSync(subPath).isDirectory()) {
            if(ext === '.framework') {
                libs.push(subPath);
            } else {
                libs = libs.concat(findPluginLibrary(subPath));
            }
        } else {
            if(ext === '.a') {
                libs.push(subPath);
            }
        }
    });
    return libs;
}

// remove AppDelegate.m and main.m form project
function removeEntrySourceFile(pbx) {
    var delegateFile = pbx.removeSourceFile('AppDelegate.m'),
        mainFile = pbx.removeSourceFile('main.m');
    removeFromGroup(pbx, delegateFile, 'Classes');
    removeFromGroup(pbx, mainFile, 'Other Sources');
}

function removeFromGroup(pbx, file, group) {
    var children = pbx.pbxGroupByName(group).children;
    for(i in children) {
        if(file.fileRef == children[i].value && file.basename == children[i].comment) {
            children.splice(i, 1);
            break;
        }
    }
}

// collect all system frameworks used by project, excluding static library
function collectSystemFrameworks(pbx) {
    var children = pbx.pbxGroupByName('Frameworks').children;
    var frameworks = [];
    var customFrameworks = pluginLibs.filter(function(p) {
        return path.extname(p).toLowerCase() === '.framework';
    });
    customFrameworks = customFrameworks.map(function(p) {
        return path.basename(p);
    });
    children.forEach(function(child) {
        var name = child.comment;
        if(path.extname(name) != '.a' && customFrameworks.indexOf(name) == -1) {
            frameworks.push(name);
        }
    });
    return frameworks;
}
