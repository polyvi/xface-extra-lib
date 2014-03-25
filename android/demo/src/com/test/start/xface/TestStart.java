package com.test.start.xface;

import com.polyvi.xface.lib.XFaceLibActivity;
import com.polyvi.xface.lib.XFaceLibLauncher;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.view.View.OnClickListener;
import android.widget.Button;

public class TestStart extends Activity {

	private Button button;

	@Override
	public void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		this.setContentView(R.layout.main);
		button = (Button) this.findViewById(R.id.button1);
		button.setOnClickListener(new OnClickListener() {
			@Override
			public void onClick(View v) {
				// 传递给xface的参数
				String parameter = "{\"action\" :\"home\",\"userInfo\": {\"id\":\"\",\"m_id\":\"\",\"isLogin\" :false}}";
				// 启动xface的接口
				XFaceLibLauncher.startXface(TestStart.this, parameter);
			}
		});
	}

	@Override
	protected void onActivityResult(int requestCode, int resultCode, Intent data) {
		if (resultCode == XFaceLibActivity.RESULT_OK) {
			// TODO:监听xface退出后需要执行的操作
		}
	}
}
