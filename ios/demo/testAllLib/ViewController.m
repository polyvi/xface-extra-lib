//
//  ViewController.m
//  testAllLib
//
//  Created by zoe on 14-3-17.
//  Copyright (c) 2014年 Polyvi Inc. All rights reserved.
//

#import "ViewController.h"
#import "XRootViewController.h"

@interface ViewController ()
{
    UINavigationController* _nav;
    XRootViewController* rootViewController ;
}
@end

@implementation ViewController

- (void)viewDidLoad
{
    [super viewDidLoad];
	// Do any additional setup after loading the view, typically from a nib.
    UIButton* button = [UIButton buttonWithType:UIButtonTypeCustom];
    [button addTarget: self
               action: @selector(buttonClicked:)
     forControlEvents: UIControlEventTouchUpInside];

    UIViewController* rv = [[UIViewController alloc] init];
    int x = self.view.frame.size.width / 2 - 50;
    int y = self.view.frame.size.height / 2 - 50;

    button.frame = CGRectMake(x, y, 100, 100);
    button.backgroundColor = [UIColor redColor];

    [rv.view addSubview:button];

    _nav = [[UINavigationController alloc] initWithRootViewController:rv];
    [self pushViewController:rv animated:YES];
}

-(void)buttonClicked:(id)sender
{
    rootViewController = [[XRootViewController alloc] init];
    [self pushViewController:rootViewController  animated:YES];
    //[self presentViewController:rootViewController animated:YES completion:nil];

    //过5秒后给xFace发送消息
    [self performSelector:@selector(postmsg) withObject:nil afterDelay:5];
}

-(void)postmsg
{
    [[NSNotificationCenter defaultCenter] postNotificationName:kClientNotification object:nil userInfo:@{@"msg": @"this is a message from client"}];
}

- (void)didReceiveMemoryWarning
{
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}


@end
