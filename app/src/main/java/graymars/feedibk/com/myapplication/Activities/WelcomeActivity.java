package graymars.feedibk.com.myapplication.Activities;

import android.Manifest;
import android.app.ActionBar;
import android.app.Activity;
import android.app.ActivityManager;
import android.app.KeyguardManager;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.graphics.PixelFormat;
import android.media.Image;
import android.os.BatteryManager;
import android.os.Build;
import android.os.Handler;
import android.os.PowerManager;
import android.provider.*;
import android.provider.Settings;
import android.support.design.widget.CoordinatorLayout;
import android.support.design.widget.Snackbar;
import android.support.v4.app.ActivityCompat;
import android.support.v4.widget.SwipeRefreshLayout;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.telephony.TelephonyManager;
import android.util.Log;
import android.view.Gravity;
import android.view.LayoutInflater;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.view.inputmethod.InputMethodManager;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.text.SimpleDateFormat;
import java.util.Calendar;

import graymars.feedibk.com.myapplication.Constants;
import graymars.feedibk.com.myapplication.R;
import graymars.feedibk.com.myapplication.Services.BackgroundService;
import graymars.feedibk.com.myapplication.Services.InternetHelper;
import graymars.feedibk.com.myapplication.customViewGroup;

import static android.view.View.SYSTEM_UI_FLAG_FULLSCREEN;
import static android.view.View.SYSTEM_UI_FLAG_HIDE_NAVIGATION;
import static android.view.View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY;
import static android.view.View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN;
import static android.view.View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION;

public class WelcomeActivity extends AppCompatActivity {

    Button btn_getStarted;
    public static WelcomeActivity instance;
    CoordinatorLayout coordinatorLayout_welcomeActivity;
    ProgressBar progressBar_welcomeActivity;
    TextView textView_campaignName, textView_description, textView_time;
    ImageView imageView_settings;
    SwipeRefreshLayout swipeRefreshLayout;
    boolean loggedIn;
    boolean tabletSettingsUpdated;
    Handler handler = new Handler();
    static final String TAG="WELCOMEACT";
    String deviceUniqueIdentifier = null;
    TelephonyManager tm;
    private static final int REQUEST_READ_PHONE_STATE = 101;
    Intent mServiceIntent;
    private BackgroundService mSensorService;
    Context ctx;
     Snackbar snackbar=null;
    public Context getCtx() {
        return ctx;
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        //wake lock
        try {
            getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        PowerManager powerManager = (PowerManager) getSystemService(POWER_SERVICE);
        PowerManager.WakeLock wakeLock = powerManager.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "MyApp::MyWakelockTag");
        wakeLock.acquire();
          //  getWindow().addFlags(WindowManager.LayoutParams.TYPE_SYSTEM_OVERLAY);

            requestWindowFeature(Window.FEATURE_NO_TITLE);
            getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN, WindowManager.LayoutParams.FLAG_FULLSCREEN);
            setContentView(R.layout.activity_welcome);
           // startLockTask();
            tm = (TelephonyManager) this.getSystemService(Context.TELEPHONY_SERVICE);

//            ctx = this;
//            //setContentView(R.layout.activity_main);
//            mSensorService = new BackgroundService(getCtx());
//            mServiceIntent = new Intent(getCtx(), mSensorService.getClass());
//            if (!isMyServiceRunning(mSensorService.getClass())) {
//                startService(mServiceIntent);
//            }
            Intent i;
            loggedIn = getSharedPreferences("PREFERENCE", MODE_PRIVATE).getBoolean("loggedIn", false);
            if (loggedIn) {
                tabletSettingsUpdated = getSharedPreferences("PREFERENCE", MODE_PRIVATE).
                        getBoolean("tabletSettingsUpdated", false);
                if(tabletSettingsUpdated)
                {
                    loadView();
                    //refreshSurveyData();
                }
                else{
                    i = new Intent(WelcomeActivity.this, TabletSettings.class);
                    startActivity(i);
                }
            }
            else {
                i = new Intent(WelcomeActivity.this, LoginActivity.class);
                startActivity(i);
            }

        }catch (Exception e)
        {
            System.out.print(e);
        }
    }

    private void loadView() {
        instance = this;
        btn_getStarted = findViewById(R.id.btn_getStarted);
        btn_getStarted.setVisibility(View.GONE);
        swipeRefreshLayout = findViewById(R.id.swipeRefreshLayout);
        coordinatorLayout_welcomeActivity = findViewById(R.id.coordinatorLayout_welcomeActivity);
        textView_campaignName = findViewById(R.id.textView_campaignName);
        textView_description = findViewById(R.id.textView_description);
        progressBar_welcomeActivity = findViewById(R.id.progressBar_welcomeActivity);
        textView_time = findViewById(R.id.textView_time);

        SimpleDateFormat mdformat = new SimpleDateFormat("HH:mm:ss");
        String strDate =  mdformat.format(Calendar.getInstance().getTime());

        textView_time.setText(strDate);

        btn_getStarted.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {


                Boolean hid_status =getSharedPreferences("PREFERENCE", MODE_PRIVATE).getBoolean("hid_status",false);

                if(!hid_status){
                    //skipping verification activity
                Constants.emp_name ="Anonymous";
                Constants.emp_id = "124";
                //default_timer_edit default_timer_edit_text_text
                    Constants.showEmployeeInfoDialog(WelcomeActivity.this, view);
                    ((InputMethodManager)getSystemService(Context.INPUT_METHOD_SERVICE))
                            .showSoftInput(getWindow().getDecorView(), InputMethodManager.SHOW_FORCED);
//                Intent i = new Intent(WelcomeActivity.this, Feedback.class);
//                i.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
//                startActivity(i);
                    }else {

                    getSharedPreferences("PREFERENCE", MODE_PRIVATE).edit()
                            .putString("bl_device_name", "HC-05").commit();

                    if (Verification.instance != null) {
                        if (Constants.checkConnectedBluetoothDevices(WelcomeActivity.this)) {
                            Intent i = new Intent(WelcomeActivity.this, Verification.instance.getClass());
                            startActivity(i);
                        } else {
                            Intent i = new Intent(WelcomeActivity.this, Verification.class);
                            startActivity(i);
                        }
                    } else {
                        Intent i = new Intent(WelcomeActivity.this, Verification.class);
                        startActivity(i);
                    }
                }
            }
        });

        imageView_settings = findViewById(R.id.imageView_settings);
        imageView_settings.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Constants.showPasswordDialog(WelcomeActivity.this, view);
                ((InputMethodManager)getSystemService(Context.INPUT_METHOD_SERVICE))
                        .showSoftInput(getWindow().getDecorView(), InputMethodManager.SHOW_FORCED);
            }
        });
        swipeRefreshLayout.setOnRefreshListener(new SwipeRefreshLayout.OnRefreshListener() {
            @Override
            public void onRefresh() {
                getSurveyDetails();
            }
        });

        getSurveyDetails();
      //  getBatteryPercentage(WelcomeActivity.this);

        // get battery status in every 15 mins
        startTimer();
    }

    // SEND TABLET DATA IN EVERY 1 HOUR
    private void startTimer() {
        Log.e(TAG,"in start timer");

//        handler.removeMessages(0);
        new Handler().postDelayed(new Runnable() {

            @Override
            public void run() {
                try {getBatteryPercentage(WelcomeActivity.this);
                //    Toast.makeText(WelcomeActivity.this, "In battery change after 10 secs", Toast.LENGTH_SHORT).show();
                } catch (Exception e) {
                    System.out.print(e);
                }

            }
        }, 900000);
    }

    private boolean isMyServiceRunning(Class<?> serviceClass) {
        ActivityManager manager = (ActivityManager) getSystemService(Context.ACTIVITY_SERVICE);
        if (manager != null) {
            for (ActivityManager.RunningServiceInfo service : manager.getRunningServices(Integer.MAX_VALUE)) {
                if (serviceClass.getName().equals(service.service.getClassName())) {
                    Log.i ("isMyServiceRunning?", true+"");
                    return true;
                }
            }
        }
        Log.i ("isMyServiceRunning?", false+"");
        return false;
    }

    @Override
    protected void onDestroy() {
        stopService(mServiceIntent);
        Log.i("MainActivity", "onDestroy!");
        super.onDestroy();

    }



//    private void refreshSurveyData() {
//        Log.e(TAG,"in start timer refresh survey data");
////        handler.removeMessages(0);
//        new Handler().postDelayed(new Runnable() {
//
//            @Override
//            public void run() {
//                try {
//                    getSurveyDetails();
//                   // Toast.makeText(WelcomeActivity.this, "In survey change after 5 secs", Toast.LENGTH_SHORT).show();
//
//                } catch (Exception e) {
//                    System.out.print(e);
//                }
//
//            }
//        }, 5000);
//    }
    private void getSurveyDetails(){
        progressBar_welcomeActivity.setVisibility(View.VISIBLE);
        btn_getStarted.setVisibility(View.GONE);
        String[] stringrray = new String[]{Constants.base_url+"xp_android/get_survey_details", "getSurvey",
        getSharedPreferences("PREFERENCE", MODE_PRIVATE).getString("tablet_id","")};
        new InternetHelper(WelcomeActivity.this).execute(stringrray);
      //  String[] stringrray = new String[]{Constants.base_url+"get_campaign.php", "get_campaign"};
      //  new InternetHelper(WelcomeActivity.this).execute(stringrray);
    }

    @Override
    public void onResume() {
        super.onResume();
        if(loggedIn) {
                tabletSettingsUpdated = getSharedPreferences("PREFERENCE", MODE_PRIVATE).
                        getBoolean("tabletSettingsUpdated", false);
                if(tabletSettingsUpdated)
                {
                    ctx = this;
                    //setContentView(R.layout.activity_main);
                    mSensorService = new BackgroundService(getCtx());
                    mServiceIntent = new Intent(getCtx(), mSensorService.getClass());
                    if (!isMyServiceRunning(mSensorService.getClass())) {
                        startService(mServiceIntent);
                    }
                    //loadView();
                    //refreshSurveyData();
                }

        }
        /*if(loggedIn) {
            if(tabletSettingsUpdated)
            getCampaignName();
        }*/
    }

    public void dismissSnackBar(){
        if(snackbar!=null){
            snackbar.dismiss();
        }
    }
    public void showSnackBar(String message){
        try {
            swipeRefreshLayout.setRefreshing(false);
            progressBar_welcomeActivity.setVisibility(View.GONE);
           // btn_getStarted.setVisibility(VI);
             snackbar = Snackbar.make(coordinatorLayout_welcomeActivity, message,
                    Snackbar.LENGTH_INDEFINITE)
                    .setAction("Retry", new View.OnClickListener() {
                        @Override
                        public void onClick(View view) {
                            getSurveyDetails();
                        }
                    });

            // Changing message text color
            snackbar.setActionTextColor(Color.RED);
            // Changing action button text color
            View sbView = snackbar.getView();
            TextView textView = (TextView) sbView.findViewById(android.support.design.R.id.snackbar_text);
            textView.setTextColor(Color.YELLOW);
            //   snackbar.setIndeterminate(true);
            snackbar.show();

        }catch (Exception e)
        {
            System.out.print(e);
        }
    }
    public void loadCampaignName(JSONObject jsonObject){


       try {
           swipeRefreshLayout.setRefreshing(false);
           progressBar_welcomeActivity.setVisibility(View.GONE);
           btn_getStarted.setVisibility(View.VISIBLE);
           Constants.welcome_message= jsonObject.getString("welcome_message");
           Constants.tagline= jsonObject.getString("tagline");

           Constants.survey_id= jsonObject.getInt("survey_id");
           Constants.survey_name= jsonObject.getString("survey_name");
           Constants.remark_title = jsonObject.getString("remark");
           Constants.master_question = jsonObject.getString("master_question");
           Constants.followup_question = jsonObject.getString("followup_question");
           Constants.followup_question_positive = jsonObject.getString("followup_question_positive");
           Constants.followup_question_negative = jsonObject.getString("followup_question_negative");
           Constants.followup_question_neutral = jsonObject.getString("followup_question_neutral");

           Constants.followup_question_neutral_id = jsonObject.getString("followup_question_neutral_id");
           Constants.followup_question_negative_id = jsonObject.getString("followup_question_negative_id");
           Constants.followup_question_positive_id = jsonObject.getString("followup_question_positive_id");
           Constants.followup_question_id = jsonObject.getString("followup_question_id");

           Constants.option_1 = jsonObject.getString("option_1");
           Constants.option_2 = jsonObject.getString("option_2");
           Constants.option_3 = jsonObject.getString("option_3");
           Constants.option_4 = jsonObject.getString("option_4");
           Constants.option_5 = jsonObject.getString("option_5");
           Constants.option_6 = jsonObject.getString("option_6");

           Constants.option_1_positive = jsonObject.getString("option_1_positive");
           Constants.option_2_positive = jsonObject.getString("option_2_positive");
           Constants.option_3_positive = jsonObject.getString("option_3_positive");
           Constants.option_4_positive = jsonObject.getString("option_4_positive");
           Constants.option_5_positive = jsonObject.getString("option_5_positive");
           Constants.option_6_positive = jsonObject.getString("option_6_positive");

           Constants.option_1_negative = jsonObject.getString("option_1_negative");
           Constants.option_2_negative = jsonObject.getString("option_2_negative");
           Constants.option_3_negative = jsonObject.getString("option_3_negative");
           Constants.option_4_negative = jsonObject.getString("option_4_negative");
           Constants.option_5_negative = jsonObject.getString("option_5_negative");
           Constants.option_6_negative = jsonObject.getString("option_6_negative");

           Constants.option_1_neutral = jsonObject.getString("option_1_neutral");
           Constants.option_2_neutral = jsonObject.getString("option_2_neutral");
           Constants.option_3_neutral = jsonObject.getString("option_3_neutral");
           Constants.option_4_neutral = jsonObject.getString("option_4_neutral");
           Constants.option_5_neutral= jsonObject.getString("option_5_neutral");
           Constants.option_6_neutral = jsonObject.getString("option_6_neutral");

           if(!jsonObject.getString("welcome_message").equals("")){
               textView_campaignName.setText(jsonObject.getString("welcome_message"));
               textView_description.setText(jsonObject.getString("tagline"));
           }else{
               Constants.emp_name ="Anonymous";
               Constants.emp_id = "124";
               Intent i;
               i = new Intent(WelcomeActivity.this, Feedback.class);
               startActivity(i);
               finish();
           }


//           if(Constants.welcome_message.equals("") && Constants.tagline.equals("")){
//               Intent i;
//               i = new Intent(WelcomeActivity.this, Feedback.class);
//               startActivity(i);
//               finish();
//           }
          /* if (data.length() > 0) {
               for (int i = 0; i < data.length(); i++) {
                   JSONObject survey_details = data.getJSONObject(i);
                   textView_campaignName.setText(survey_details.getString("welcome_message"));
                   textView_description.setText(survey_details.getString("tagline"));
                   Constants.survey_id= survey_details.getInt("survey_id");
                   Constants.survey_name= survey_details.getString("survey_name");
               }
           }*/
       }catch (Exception e)
       {
           System.out.print(e);
       }
    }

    @Override
    public void onBackPressed(){
        // do nothing
    }

    @Override
    protected void onPause() {
        super.onPause();
        ActivityManager activityManager = (ActivityManager) getApplicationContext()
                .getSystemService(Context.ACTIVITY_SERVICE);
        activityManager.moveTaskToFront(getTaskId(), 0);
    }

    public void getBatteryPercentage(Context context) {

        IntentFilter iFilter = new IntentFilter(Intent.ACTION_BATTERY_CHANGED);
        Intent batteryStatus = context.registerReceiver(null, iFilter);

        int level = batteryStatus != null ? batteryStatus.getIntExtra(BatteryManager.EXTRA_LEVEL, -1) : -1;
        int scale = batteryStatus != null ? batteryStatus.getIntExtra(BatteryManager.EXTRA_SCALE, -1) : -1;

        float batteryPct = level / (float) scale;

        int batteryPercentage = (int)(batteryPct*100);
        String androidId = android.provider.Settings.Secure.getString(getContentResolver(),
                android.provider.Settings.Secure.ANDROID_ID);
        androidId = getDeviceIMEI();


        String[] stringrray = new String[]{Constants.base_url+"xp_android/device_status", "device_status",
                String.valueOf(batteryPercentage), androidId};
        new InternetHelper(WelcomeActivity.this).execute(stringrray);
        startTimer();

    }

    public String getDeviceIMEI() {
        if (tm != null) {
            if (ActivityCompat.checkSelfPermission(this, Manifest.permission.READ_PHONE_STATE)
                    != PackageManager.PERMISSION_GRANTED) {
                ActivityCompat.requestPermissions(this, new String[]{Manifest.permission.READ_PHONE_STATE},
                        REQUEST_READ_PHONE_STATE);
                // TODO: Consider calling
                //    ActivityCompat#requestPermissions
                // here to request the missing permissions, and then overriding
                //   public void onRequestPermissionsResult(int requestCode, String[] permissions,
                //                                          int[] grantResults)
                // to handle the case where the user grants the permission. See the documentation
                // for ActivityCompat#requestPermissions for more details.

            }
            deviceUniqueIdentifier = tm.getDeviceId();
        }
        if (null == deviceUniqueIdentifier || 0 == deviceUniqueIdentifier.length()) {
            deviceUniqueIdentifier = android.provider.Settings.Secure.getString(this.getContentResolver(), Settings.Secure.ANDROID_ID);
        }
        return deviceUniqueIdentifier;
    }
}
