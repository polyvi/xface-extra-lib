package com.polyvi.xface.lib;

import android.os.Bundle;

import com.polyvi.xface.XFaceMainActivity;

public class XFaceLibActivity extends XFaceMainActivity {
	public static final int RESULT_OK = 100000;

	@Override
	public void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
	}

	@Override
	public void finish() {
		setResult(RESULT_OK);
		super.finish();
	}
}
