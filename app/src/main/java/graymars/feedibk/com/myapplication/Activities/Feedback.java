package graymars.feedibk.com.myapplication.Activities;

import android.annotation.SuppressLint;
import android.app.ActivityManager;
import android.content.Context;
import android.content.Intent;
import android.graphics.Color;
import android.os.CountDownTimer;
import android.os.Handler;
import android.os.PowerManager;
import android.support.design.widget.CoordinatorLayout;
import android.support.design.widget.Snackbar;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.view.MotionEvent;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.view.inputmethod.InputMethodManager;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import de.hdodenhof.circleimageview.CircleImageView;
import graymars.feedibk.com.myapplication.Constants;
import graymars.feedibk.com.myapplication.Helper.CryptLib;
import graymars.feedibk.com.myapplication.R;
import graymars.feedibk.com.myapplication.Services.InternetHelper;

public class Feedback extends AppCompatActivity implements View.OnClickListener {

    Button btn_submit;
    CircleImageView imageView_terrible, imageView_bad, imageView_okay, imageView_good, imageView_great;
    String category, subcategory, issue, option, multi_option;
    int rating=0;
    ProgressBar progressBar_feedback;
    EditText editText_feedback;
    public static Feedback instance;
    ImageView imageView_settings, imageView_backArrow_survey;
    Handler handler = new Handler();
    CoordinatorLayout coordinatorLayout_feedback;
    CryptLib cryptLib;
    CountDownTimer countDownTimer;
    int default_timer;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        try {
            //getWindow().addFlags(WindowManager.LayoutParams.TYPE_SYSTEM_OVERLAY);
            requestWindowFeature(Window.FEATURE_NO_TITLE);
            getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN, WindowManager.LayoutParams.FLAG_FULLSCREEN);
            setContentView(R.layout.activity_feedback);

//            getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);

//            PowerManager powerManager = (PowerManager) getSystemService(POWER_SERVICE);
//            PowerManager.WakeLock wakeLock = powerManager.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK,
//                    "MyApp::MyWakelockTag");
//            wakeLock.acquire();
            instance = this;
            default_timer = Integer.parseInt(getSharedPreferences("PREFERENCE", MODE_PRIVATE).getString("tablet_timer", ""));

            cryptLib = new CryptLib();

            /*Set timeout of 2 mins of inactivity*/
            handler.removeMessages(0);

            handler.postDelayed(new Runnable() {

                @Override
                public void run() {

                    try {
                        Constants.emp_id = null;
                        Constants.emp_name = null;
                        Constants.survey_id= null;
                        Constants.survey_question = null;
                        handler.removeMessages(0);
                        Intent i = new Intent(Feedback.this, WelcomeActivity.class);
                        i.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
                        startActivity(i);
                        finish();

                    }catch (Exception e)
                    {
                        e.printStackTrace();
                    }

                }
            }, default_timer*1000*60);

            Bundle b = getIntent().getExtras();
            if(Survey_MultiOption.instance.CallingFromSurvery_MultiOption)
            {
                multi_option = b.getString("multioption");
            }
            else {
                category = b.getString("category");
                subcategory = b.getString("subcategory");
                issue = b.getString("issue");
                option = b.getString("option");
            }

            coordinatorLayout_feedback = findViewById(R.id.coordinatorLayout_feedback);
            imageView_backArrow_survey = findViewById(R.id.imageView_backArrow_survey);

            coordinatorLayout_feedback.setOnTouchListener(new View.OnTouchListener() {
                @SuppressLint("ClickableViewAccessibility")
                @Override
                public boolean onTouch(View view, MotionEvent motionEvent) {
                    InputMethodManager imm = (InputMethodManager) getSystemService(INPUT_METHOD_SERVICE);
                    imm.hideSoftInputFromWindow(getWindow().getDecorView().getRootView().getWindowToken(), 0);
                    return true;
                }
            });
            imageView_backArrow_survey.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View view) {
                    handler.removeMessages(0);
                    Feedback.super.onBackPressed();
                }
            });

            imageView_settings = findViewById(R.id.imageView_settings);
            imageView_settings.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View view) {
                    Constants.showPasswordDialog(Feedback.this, view);
                    ((InputMethodManager)getSystemService(Context.INPUT_METHOD_SERVICE))
                            .showSoftInput(getWindow().getDecorView(), InputMethodManager.SHOW_FORCED);
                }
            });

            imageView_terrible = findViewById(R.id.imageView_terrible);
            imageView_bad = findViewById(R.id.imageView_bad);
            imageView_okay = findViewById(R.id.imageView_okay);
            imageView_good = findViewById(R.id.imageView_good);
            imageView_great = findViewById(R.id.imageView_great);
            progressBar_feedback = findViewById(R.id.progressBar_feedback);
            editText_feedback = findViewById(R.id.editText_feedback);

            editText_feedback.setOnClickListener(this);

            imageView_terrible.setOnClickListener(this);
            imageView_bad.setOnClickListener(this);
            imageView_okay.setOnClickListener(this);
            imageView_good.setOnClickListener(this);
            imageView_great.setOnClickListener(this);

            btn_submit = findViewById(R.id.btn_submit);
            btn_submit.setOnClickListener(this);
        }catch (Exception e)
        {
            e.printStackTrace();
        }
    }

    @Override
    public void onClick(View view) {

        if(view.getId()==R.id.imageView_terrible)
        {
            imageView_terrible.setBorderWidth(5);
            imageView_bad.setBorderWidth(0);
            imageView_okay.setBorderWidth(0);
            imageView_good.setBorderWidth(0);
            imageView_great.setBorderWidth(0);
            rating =1;
        }
        else if(view.getId()==R.id.imageView_bad)
        {
            imageView_terrible.setBorderWidth(0);
            imageView_bad.setBorderWidth(5);
            imageView_okay.setBorderWidth(0);
            imageView_good.setBorderWidth(0);
            imageView_great.setBorderWidth(0);
            rating =2;
        }
        else if(view.getId() == R.id.imageView_okay)
        {
            imageView_terrible.setBorderWidth(0);
            imageView_bad.setBorderWidth(0);
            imageView_okay.setBorderWidth(5);
            imageView_good.setBorderWidth(0);
            imageView_great.setBorderWidth(0);
            rating=3;
        }
        else if(view.getId() == R.id.imageView_good)
        {
            imageView_terrible.setBorderWidth(0);
            imageView_bad.setBorderWidth(0);
            imageView_okay.setBorderWidth(0);
            imageView_good.setBorderWidth(5);
            imageView_great.setBorderWidth(0);
            rating =4;
        }
        else if(view.getId() == R.id.imageView_great)
        {
            imageView_terrible.setBorderWidth(0);
            imageView_bad.setBorderWidth(0);
            imageView_okay.setBorderWidth(0);
            imageView_good.setBorderWidth(0);
            imageView_great.setBorderWidth(5);
            rating =5;
        }
        else if(view.getId()== R.id.editText_feedback)
        {
            ((InputMethodManager)getSystemService(Context.INPUT_METHOD_SERVICE))
                    .showSoftInput(editText_feedback, InputMethodManager.SHOW_FORCED);
        }
        else if (view.getId() == R.id.btn_submit){

            String[] stringrray = null;
            if(rating==0)
            {
                Toast.makeText(Feedback.this, "Please select a rating", Toast.LENGTH_SHORT).show();
            }
            else if(editText_feedback.getText().toString().equals(""))
            {
                Toast.makeText(Feedback.this, "Please write review to continue", Toast.LENGTH_SHORT).show();
            }
            else {
                ((InputMethodManager)getSystemService(Context.INPUT_METHOD_SERVICE))
                        .hideSoftInputFromWindow(editText_feedback.getWindowToken(), 0);
                progressBar_feedback.setVisibility(View.VISIBLE);
                btn_submit.setVisibility(View.GONE);

                if(Survey_MultiOption.instance.CallingFromSurvery_MultiOption)
                {
                   update_response_multioption();
                }
                else {
                    update_response();
                }
            }
        }
    }

    private void update_response_multioption(){

          //  Constants.emp_id = cryptLib.encryptPlainTextWithRandomIV(Constants.emp_id, Constants.key);
            try{
            String[] stringrray = new String[]{Constants.getBaseURL(Feedback.this) + "responses.php", "add_response",
                    "", "", "", "", String.valueOf(rating), editText_feedback.getText().toString(),
                    cryptLib.encryptPlainTextWithRandomIV(Constants.emp_id, Constants.key),
                    String.valueOf(Constants.campaign_id), Constants.survey_id, multi_option,
                    getSharedPreferences("PREFERENCE", MODE_PRIVATE).getString("tablet_uuid", "")};
            new InternetHelper(Feedback.this).execute(stringrray);
               countDownTimer=  new CountDownTimer(30000, 1000) {

                    public void onTick(long millisUntilFinished) {

                    }

                    public void onFinish() {
                        showSnackBar("Server response is slow. Please try again");
                    }
                }.start();
        }catch (Exception e)
        {
            e.printStackTrace();
        }
    }

    private void update_response(){
        //Toast.makeText(this, "Reached here", Toast.LENGTH_LONG).show();
       // Constants.emp_id = cryptLib.encryptPlainTextWithRandomIV(Constants.emp_id, Constants.key);
        try {
            String[] stringrray = new String[]{Constants.getBaseURL(Feedback.this) + "responses.php",
                    "add_response", category, subcategory,
                    issue, option, String.valueOf(rating), editText_feedback.getText().toString(),
                    cryptLib.encryptPlainTextWithRandomIV(Constants.emp_id, Constants.key),
                    String.valueOf(Constants.campaign_id), Constants.survey_id, "",
                    getSharedPreferences("PREFERENCE", MODE_PRIVATE).getString("tablet_uuid", "")};

            new InternetHelper(Feedback.this).execute(stringrray);

            countDownTimer=  new CountDownTimer(10000, 1000) {

                public void onTick(long millisUntilFinished) {

                }

                public void onFinish() {

                   try {
                       Constants.skip_thankYouPage = true;
                       handler.removeMessages(0);
                       Intent i = new Intent(Feedback.this, ThankYouPage.class);
                       startActivity(i);
                   }catch (Exception e)
                   {
                       e.printStackTrace();
                   }
                    //showSnackBar("Server response is slow. Please try again");
                }
            }.start();
        }catch (Exception e)
        {
            e.printStackTrace();
        }
    }


    public void RecordInserted(){
        try {
            handler.removeMessages(0);
            Intent i = new Intent(Feedback.this, ThankYouPage.class);
            startActivity(i);
            countDownTimer.cancel();
        }catch (Exception e)
        {
            e.printStackTrace();
        }

    }

    @Override
    protected void onPause() {
        super.onPause();
        ActivityManager activityManager = (ActivityManager) getApplicationContext()
                .getSystemService(Context.ACTIVITY_SERVICE);
        activityManager.moveTaskToFront(getTaskId(), 0);
    }

    public void showSnackBar(String message){
        progressBar_feedback.setVisibility(View.GONE);
        // btn_getStarted.setVisibility(VI);
        final Snackbar snackbar = Snackbar.make(coordinatorLayout_feedback, message,
                Snackbar.LENGTH_INDEFINITE)
                .setAction("Retry", new View.OnClickListener() {
                    @Override
                    public void onClick(View view) {

                        if(Survey_MultiOption.instance.CallingFromSurvery_MultiOption)
                        {
                            update_response_multioption();
                        }
                        else {
                            update_response();
                        }
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
    }

    @Override
    protected void onUserLeaveHint()
    {
        handler.removeMessages(0);
    }
}
