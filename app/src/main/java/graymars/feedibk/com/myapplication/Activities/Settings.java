package graymars.feedibk.com.myapplication.Activities;

import android.app.ActivityManager;
import android.content.Context;
import android.content.Intent;
import android.os.Handler;
import android.os.PowerManager;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.widget.CompoundButton;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.RelativeLayout;
import android.widget.Switch;
import android.widget.TextView;
import android.widget.Toast;

import graymars.feedibk.com.myapplication.Constants;
import graymars.feedibk.com.myapplication.R;

public class Settings extends AppCompatActivity {

    LinearLayout linearLayout_menu_settings, linearLayout_menu_logout, linearLayout_menu_system_settings;
    ImageView imageView_backArrow,imageview_save_default_timer;
    public static Settings instance;
    Handler handler = new Handler();
    EditText default_timer_edit_text;
    RelativeLayout rel_menu_tablet_timer;
    TextView text_view_default_timer;
    Switch switch_hid;


    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        //wake lock
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        PowerManager powerManager = (PowerManager) getSystemService(POWER_SERVICE);
        PowerManager.WakeLock wakeLock = powerManager.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "MyApp::MyWakelockTag");
        wakeLock.acquire();
        try {
          //  getWindow().addFlags(WindowManager.LayoutParams.TYPE_SYSTEM_OVERLAY);
            requestWindowFeature(Window.FEATURE_NO_TITLE);
            getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN, WindowManager.LayoutParams.FLAG_FULLSCREEN);
            setContentView(R.layout.activity_settings);
            instance = this;

            String timerstr =getSharedPreferences("PREFERENCE", MODE_PRIVATE).getString("tablet_timer", "");
            int timer;
            if(timerstr!="") {
                timer = Integer.parseInt(timerstr);
            }else{
                timer=1;
            }
            handler.removeMessages(0);

            Log.e("timer : ",String.valueOf(timer));
        /*Set timeout of 30 seconds of inactivity*/

            handler.removeMessages(0);
            handler.postDelayed(new Runnable() {

                @Override
                public void run() {

                    try {
                        Constants.emp_id = null;
                        Constants.emp_name = null;
                        Constants.survey_id = null;
                        Constants.survey_name = null;
                        handler.removeMessages(0);
                        Intent i = new Intent(Settings.this, WelcomeActivity.class);
                        startActivity(i);
                        finish();

                    } catch (Exception e) {
                        System.out.print(e);
                    }

                }
            }, timer*1000*60);

            linearLayout_menu_settings = findViewById(R.id.linearLayout_menu_settings);
            linearLayout_menu_logout = findViewById(R.id.linearLayout_menu_logout);
            linearLayout_menu_system_settings = findViewById(R.id.linearLayout_menu_system_settings);
            switch_hid=findViewById(R.id.switch_hid);

            Boolean hid_status =getSharedPreferences("PREFERENCE", MODE_PRIVATE).getBoolean("hid_status",false);

            if(hid_status){
                switch_hid.setChecked(true);
            }else{
                switch_hid.setChecked(false);
            }

            switch_hid.setOnCheckedChangeListener(new CompoundButton.OnCheckedChangeListener() {
                @Override
                public void onCheckedChanged(CompoundButton compoundButton, boolean b) {
                    getSharedPreferences("PREFERENCE", MODE_PRIVATE).edit()
                            .putBoolean("hid_status", b).commit();

                    if(b){
                        Toast.makeText(Settings.this, "HID verification enabled", Toast.LENGTH_SHORT).show();
                    }else{
                        Toast.makeText(Settings.this, "HID verification disabled", Toast.LENGTH_SHORT).show();

                    }
                }
            });
            //switch_hid.setChecked(true);

            default_timer_edit_text= findViewById((R.id.default_timer_edit_text));
            //imageview_edit_default_timer= findViewById((R.id.imageview_edit_default_timer));
            imageview_save_default_timer= findViewById((R.id.imageview_save_default_timer));
            text_view_default_timer=findViewById(R.id.text_view_default_timer);
            rel_menu_tablet_timer=findViewById(R.id.rel_menu_tablet_timer);

            imageView_backArrow = findViewById(R.id.imageView_backArrow);
            linearLayout_menu_settings.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View view) {
                    handler.removeMessages(0);
                    Intent i = new Intent(Settings.this, TabletSettings.class);
                    startActivity(i);
                }
            });

            linearLayout_menu_system_settings.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View view) {
                    handler.removeMessages(0);
                    startActivityForResult(new Intent(android.provider.Settings.ACTION_SETTINGS), 0);
                }
            });

            linearLayout_menu_logout.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View view) {
                    handler.removeMessages(0);
                    getSharedPreferences("PREFERENCE", 0).edit().clear().commit();
                    Intent i = new Intent(Settings.this, LoginActivity.class);
                    startActivity(i);
                }
            });

            text_view_default_timer.setText("Tablet Timer : "+String.valueOf(timer)+" (in mins)");
            default_timer_edit_text.setText(String.valueOf(timer));
            text_view_default_timer.setVisibility(View.VISIBLE);
            default_timer_edit_text.setVisibility(View.GONE);
            imageview_save_default_timer.setVisibility(View.GONE);



            rel_menu_tablet_timer.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View view) {
                    default_timer_edit_text.setEnabled(true);
                    text_view_default_timer.setVisibility(View.GONE);
                    default_timer_edit_text.setVisibility(View.VISIBLE);
                    imageview_save_default_timer.setVisibility(View.VISIBLE);

                }
            });

            text_view_default_timer.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View view) {
                    default_timer_edit_text.setEnabled(true);
                    text_view_default_timer.setVisibility(View.GONE);
                    default_timer_edit_text.setVisibility(View.VISIBLE);
                    imageview_save_default_timer.setVisibility(View.VISIBLE);

                }
            });



            imageview_save_default_timer.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View view) {
                    if(!(default_timer_edit_text.getText().toString().equals("0"))) {
                        default_timer_edit_text.setEnabled(false);
                        text_view_default_timer.setText("Tablet Timer : " + default_timer_edit_text.getText().toString() + " (in mins)");
                        Toast.makeText(Settings.this, "Timer saved", Toast.LENGTH_SHORT).show();
                        getSharedPreferences("PREFERENCE", MODE_PRIVATE).edit()
                                .putString("tablet_timer", default_timer_edit_text.getText().toString()).commit();
                        text_view_default_timer.setVisibility(View.VISIBLE);
                        default_timer_edit_text.setVisibility(View.GONE);
                        imageview_save_default_timer.setVisibility(View.GONE);
                    }else{
                        Toast.makeText(Settings.this, "Enter time other than 0", Toast.LENGTH_SHORT).show();
                    }
                }
            });

            imageView_backArrow.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View view) {
                    handler.removeMessages(0);
                    Settings.super.onBackPressed();
                }
            });
        }catch (Exception e)
        {
            System.out.print(e);
        }
    }

    @Override
    protected void onPause() {
        super.onPause();
     /*   ActivityManager activityManager = (ActivityManager) getApplicationContext()
                .getSystemService(Context.ACTIVITY_SERVICE);
        activityManager.moveTaskToFront(getTaskId(), 0);*/
    }


    @Override
    protected void onUserLeaveHint()
    {
        handler.removeMessages(0);
    }
}
