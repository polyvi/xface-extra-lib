package com.polyvi.xface.lib;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;

import com.polyvi.xface.XFaceMainActivity;

public class XFaceLibActivity extends XFaceMainActivity {
	public static final int RESULT_OK = 100000;
	private static Activity activity;

	@Override
	public void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		activity = this;
	}

	public static Activity getInstance() {
		return activity;
	}

	@Override
	public void finish() {
		setResult(RESULT_OK);
		super.finish();
	}

	@Override
	public void endActivity() {
		if (Intent.FLAG_ACTIVITY_REORDER_TO_FRONT == getIntent().getFlags()) {
			Object targetClass = getIntent().getSerializableExtra(
					XFaceLibLauncher.TARGET_CLASS);
			Intent intent = new Intent(this, (Class) targetClass);
			intent.addFlags(Intent.FLAG_ACTIVITY_REORDER_TO_FRONT);
			startActivity(intent);
		} else {
			super.endActivity();
		}
	}
}
