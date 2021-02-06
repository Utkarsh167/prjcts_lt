package graymars.feedibk.com.myapplication.Activities;

import android.Manifest;
import android.annotation.TargetApi;
import android.app.Activity;
import android.app.ActivityManager;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.PixelFormat;
import android.net.Uri;
import android.os.Build;
import android.os.Handler;
import android.os.PowerManager;
import android.support.annotation.RequiresApi;
import android.support.v4.app.ActivityCompat;
import android.support.v4.content.ContextCompat;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.util.Log;
import android.view.Gravity;
import android.view.Window;
import android.view.WindowManager;
import android.widget.Toast;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;

import graymars.feedibk.com.myapplication.Constants;
import graymars.feedibk.com.myapplication.R;
import graymars.feedibk.com.myapplication.customViewGroup;
import android.provider.Settings;
import android.bluetooth.BluetoothSocket;

public class SplashScreen extends AppCompatActivity {

    public static int SPLASH_TIME_OUT = 3000;
    public static final int REQUEST_PERMISSION = 123;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        //wake lock
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        PowerManager powerManager = (PowerManager) getSystemService(POWER_SERVICE);
        PowerManager.WakeLock wakeLock = powerManager.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "MyApp::MyWakelockTag");
        wakeLock.acquire();
        try {
            //getWindow().addFlags(WindowManager.LayoutParams.TYPE_SYSTEM_OVERLAY);
            requestWindowFeature(Window.FEATURE_NO_TITLE);
            getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN, WindowManager.LayoutParams.FLAG_FULLSCREEN);
            setContentView(R.layout.activity_splash_screen);
          /*  if (!Settings.canDrawOverlays(this)) {
                Intent myIntent = new Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION);
                myIntent.setData(Uri.parse("package: " + getPackageName()));
                startActivityForResult(myIntent, 101);
            }*/
          //  preventStatusBarExpansion(this);
            startTimer();

           /* getSharedPreferences("PREFERENCE", 0).edit().clear().commit();
            Intent i = new Intent(SplashScreen.this, LoginActivity.class);
            startActivity(i);*/

        }catch (Exception e)
        {
            Toast.makeText(this, e.toString(), Toast.LENGTH_LONG).show();
            System.out.print(e);
        }
    }


    private void startTimer(){
        new Handler().postDelayed(new Runnable() {

            @Override
            public void run() {

                try {
                    Constants.emp_id = null;
                    Constants.emp_name = null;
                    Constants.survey_id = null;
                    Constants.survey_name = null;
                    Intent i = new Intent(SplashScreen.this, WelcomeActivity.class);
                    String timerstr =getSharedPreferences("PREFERENCE", MODE_PRIVATE).getString("tablet_timer", "");
                    int timer;
                    if(timerstr!="") {
                        timer = Integer.parseInt(timerstr);
                        getSharedPreferences("PREFERENCE", MODE_PRIVATE).edit()
                                .putString("tablet_timer", String.valueOf(timer)).commit();
                    }else{
                        timer=1;
                        getSharedPreferences("PREFERENCE", MODE_PRIVATE).edit()
                                .putString("tablet_timer", String.valueOf(timer)).commit();

                    }
                    startActivity(i);
                    finish();

                } catch (Exception e) {
                    System.out.print(e);
                }

            }
        }, SPLASH_TIME_OUT);
    }

    @Override
    protected void onPause() {
        super.onPause();
        ActivityManager activityManager = (ActivityManager) getApplicationContext()
                .getSystemService(Context.ACTIVITY_SERVICE);
        activityManager.moveTaskToFront(getTaskId(), 0);
    }

    public static void preventStatusBarExpansion(Context context) {
       try {
           WindowManager manager = ((WindowManager) context.getApplicationContext()
                   .getSystemService(Context.WINDOW_SERVICE));

           Activity activity = (Activity) context;
           WindowManager.LayoutParams localLayoutParams = new WindowManager.LayoutParams();
           localLayoutParams.type = WindowManager.LayoutParams.TYPE_SYSTEM_ERROR;
           localLayoutParams.gravity = Gravity.TOP;
           localLayoutParams.flags = WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE |

                   // this is to enable the notification to recieve touch events
                   WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL |

                   // Draws over status bar
                   WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN;

           localLayoutParams.width = WindowManager.LayoutParams.MATCH_PARENT;
           int resId = activity.getResources().getIdentifier("status_bar_height", "dimen", "android");
           int result = 0;
           if (resId > 0) {
               result = activity.getResources().getDimensionPixelSize(resId);
           }

           localLayoutParams.height = result;

           localLayoutParams.format = PixelFormat.TRANSPARENT;

           customViewGroup view = new customViewGroup(context);

           manager.addView(view, localLayoutParams);
       }catch (Exception e)
       {
           System.out.print(e);
       }
    }
}
