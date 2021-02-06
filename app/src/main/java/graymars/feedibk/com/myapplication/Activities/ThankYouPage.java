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
import android.view.inputmethod.InputMethodManager;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.TextView;

import graymars.feedibk.com.myapplication.Constants;
import graymars.feedibk.com.myapplication.R;

public class ThankYouPage extends AppCompatActivity {

    ImageView imageView_settings;
    TextView textView_title_thankYouPage;
    Handler handler=  new Handler();


    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        //wake lock
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        PowerManager powerManager = (PowerManager) getSystemService(POWER_SERVICE);
        PowerManager.WakeLock wakeLock = powerManager.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "MyApp::MyWakelockTag");
        wakeLock.acquire();

        try {
           // getWindow().addFlags(WindowManager.LayoutParams.TYPE_SYSTEM_OVERLAY);
            requestWindowFeature(Window.FEATURE_NO_TITLE);
            getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN, WindowManager.LayoutParams.FLAG_FULLSCREEN);
            setContentView(R.layout.activity_thank_you_page);

            String inc_emp_id=getSharedPreferences("PREFERENCE", MODE_PRIVATE).
                    getString("inc_emp_id", "");
            textView_title_thankYouPage = findViewById(R.id.textView_title_thankYouPage);
            Log.e("THANKYOUSCREEN",Constants.emp_id.toString());
            Boolean hid_status =getSharedPreferences("PREFERENCE", MODE_PRIVATE).getBoolean("hid_status",false);
            if(!hid_status) {
                textView_title_thankYouPage.setText("Thank you " + Constants.emp_id.toString());

            }
            else {
                textView_title_thankYouPage.setText("Thank you " + Constants.emp_name.toString());
            }
//            textView_title_thankYouPage.setText("Thank you");

            //  textView_title_thankYouPage.setText("Thank you");

            imageView_settings = findViewById(R.id.imageView_settings);
            imageView_settings.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View view) {
                    Constants.showPasswordDialog(ThankYouPage.this, view);
                    ((InputMethodManager)getSystemService(Context.INPUT_METHOD_SERVICE))
                            .showSoftInput(getWindow().getDecorView(), InputMethodManager.SHOW_FORCED);
                }
            });

            handler.removeMessages(0);
            new Handler().postDelayed(new Runnable() {

                @Override
                public void run() {

                    try {
                        Constants.emp_id = null;
                        Constants.emp_name = null;
                        Constants.survey_id = null;
                        Constants.survey_name = null;
                        handler.removeMessages(0);
                        Intent i;
                        if(Constants.welcome_message.equals("")){
                             i = new Intent(ThankYouPage.this, Feedback.class);
                        }else {
                             i = new Intent(ThankYouPage.this, WelcomeActivity.class);
                        }
                        startActivity(i);
                        finish();

                    } catch (Exception e) {
                        System.out.print(e);
                    }

                }
            }, 3000);

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
    @Override
    protected void onUserLeaveHint()
    {
        handler.removeMessages(0);
    }
}
