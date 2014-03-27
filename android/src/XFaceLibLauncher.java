package com.polyvi.xface.lib;

import android.app.Activity;
import android.content.Intent;

import com.polyvi.xface.util.XConstant;

public class XFaceLibLauncher {
	public static final String TARGET_CLASS = "TargetClass";

	public static final void startXface(Activity activity, String params,
			boolean isOptimization) {
		Intent intent = new Intent();
		intent.setAction("android.intent.action.XFACELIBLAUNCHER");
		if (null != params) {
			params = params.replaceAll("'", "\\\\'");
			params = params.replaceAll("\"", "\\\\\"");
			intent.putExtra(XConstant.TAG_APP_START_PARAMS, params);
		}
		if (isOptimization) {
			intent.addFlags(Intent.FLAG_ACTIVITY_REORDER_TO_FRONT);
		}
		intent.putExtra(TARGET_CLASS, activity.getClass());
		activity.startActivityForResult(intent, 0);
	}

	public static final void endXface() {
		if (null != XFaceLibActivity.getInstance()) {
			XFaceLibActivity.getInstance().finish();
		}
	}
}