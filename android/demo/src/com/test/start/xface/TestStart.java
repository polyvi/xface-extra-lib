package com.test.start.xface;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.view.View.OnClickListener;
import android.widget.Button;

import com.polyvi.xface.lib.XFaceLibActivity;
import com.polyvi.xface.lib.XFaceLibLauncher;

public class TestStart extends Activity {

	private Button button;

	@Override
	public void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		this.setContentView(R.layout.main);
		button = (Button) this.findViewById(R.id.button1);
		final TestStart self = this;
		button.setOnClickListener(new OnClickListener() {
			@Override
			public void onClick(View v) {
				String parameter = "{\"action\" :\"home\",\"userInfo\": {\"id\":\"\",\"m_id\":\"\",\"isLogin\" :false}}";
				XFaceLibLauncher.startXface(self, XFaceLibActivity.class,  parameter, false);
			}
		});
	}

	@Override
	protected void onActivityResult(int requestCode, int resultCode, Intent data) {
		if (resultCode == XFaceLibActivity.RESULT_OK) {
			
		}
	}
}
