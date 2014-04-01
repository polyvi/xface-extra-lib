package com.polyvi.xface.lib;

import java.util.Stack;

import android.app.Activity;

public class XFaceLibActivityManager {
	private static Stack<Activity> activityStack;
	private static XFaceLibActivityManager instance;

	private XFaceLibActivityManager() {
	}

	public static XFaceLibActivityManager getInstance() {
		if (instance == null) {
			instance = new XFaceLibActivityManager();
		}
		return instance;
	}

	private void popActivity(Activity activity) {
		if (activity != null) {
			activity.finish();
			activity = null;
		}
	}

	public void pushActivity(Activity activity) {
		if (activityStack == null) {
			activityStack = new Stack<Activity>();
		}
		activityStack.add(activity);
	}

	public void popAllActivity() {
		if (null == activityStack) {
			return;
		}
		for (int i = 0; i < activityStack.size(); i++) {
			popActivity(activityStack.get(i));
		}
		activityStack.clear();
	}
}