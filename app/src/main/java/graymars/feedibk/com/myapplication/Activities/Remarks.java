package graymars.feedibk.com.myapplication.Activities;

import android.app.Activity;
import android.app.ActivityManager;
import android.content.Context;
import android.content.Intent;
import android.graphics.Color;
import android.os.Handler;
import android.os.PowerManager;
import android.support.design.widget.CoordinatorLayout;
import android.support.design.widget.Snackbar;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.util.Log;
import android.view.MotionEvent;
import android.view.View;
import android.view.ViewGroup;
import android.view.Window;
import android.view.WindowManager;
import android.view.inputmethod.InputMethodManager;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import graymars.feedibk.com.myapplication.Constants;
import graymars.feedibk.com.myapplication.R;
import graymars.feedibk.com.myapplication.Services.InternetHelper;

public class Remarks extends AppCompatActivity {

    TextView textView_title_remarks;
    EditText editText_remarks;
    Button btn_submit_remarks;
    String followup_question , followup_question_id, option_1, option_2, option_3, option_4, option_5, option_6, rating,
            selected_option;
    ProgressBar progressBar_remarkScreen;
    Handler handler = new Handler();
    CoordinatorLayout coordinatorLayout_remarks;
    int default_timer;

    public static Remarks instance;
    int res_counter;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        //wake lock
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        PowerManager powerManager = (PowerManager) getSystemService(POWER_SERVICE);
        PowerManager.WakeLock wakeLock = powerManager.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "MyApp::MyWakelockTag");
        wakeLock.acquire();
        requestWindowFeature(Window.FEATURE_NO_TITLE);
        getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN, WindowManager.LayoutParams.FLAG_FULLSCREEN);
        setContentView(R.layout.activity_remarks);

        instance = this;


        Bundle b = getIntent().getExtras();
        followup_question = b.getString("followup_question");
        followup_question_id = b.getString("followup_question_id");
        option_1 = b.getString("option_1");
        option_2 = b.getString("option_2");
        option_3 = b.getString("option_3");
        option_4 = b.getString("option_4");
        option_5 = b.getString("option_5");
        option_6 = b.getString("option_6");
        rating = b.getString("rating");
        selected_option = b.getString("selected_option");
        default_timer = Integer.parseInt(getSharedPreferences("PREFERENCE", MODE_PRIVATE).getString("tablet_timer", ""));


        handler.postDelayed(new Runnable() {

            @Override
            public void run() {

                try {
                    Constants.emp_id = null;
                    Constants.emp_name = null;
                    Constants.survey_id = null;
                    Constants.survey_name = null;
                    handler.removeMessages(0);
                    Intent i = new Intent(Remarks.this, WelcomeActivity.class);
                    startActivity(i);
                    finish();

                } catch (Exception e) {
                    System.out.print(e);
                }

            }
        }, default_timer*1000*60);

        textView_title_remarks = findViewById(R.id.textView_title_remarks);
        editText_remarks = findViewById(R.id.editText_remarks);
        btn_submit_remarks = findViewById(R.id.btn_submit_remarks);
        coordinatorLayout_remarks = findViewById(R.id.coordinatorLayout_remarks);
        progressBar_remarkScreen = findViewById(R.id.progressBar_remarkScreen);


        coordinatorLayout_remarks.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                InputMethodManager inputMethodManager =(InputMethodManager)getSystemService(Activity.INPUT_METHOD_SERVICE);
                inputMethodManager.hideSoftInputFromWindow(view.getWindowToken(), 0);
                //Toast.makeText(Remarks.this, "On coordinator click", Toast.LENGTH_SHORT).show();
            }
        });

        editText_remarks.setOnFocusChangeListener(new View.OnFocusChangeListener() {
            @Override
            public void onFocusChange(View v, boolean hasFocus) {
                if (!hasFocus) {
                    hideKeyboard(v);
                }
            }
        });
        if(Constants.remark_title.equals(""))
        {
            addResponseIncrement();
        }
        else {
            textView_title_remarks.setText(Constants.remark_title);
        }

        btn_submit_remarks.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
              // addResponse();
                addResponseIncrement();
            }
        });
    }

    private void addResponse(){
        String comment = editText_remarks.getText().toString();
        String[] stringrray = new String[]{Constants.base_url + "xp_android/add_response", "add_response", "", "",
                "", "", String.valueOf(rating), comment,
                Constants.emp_id,
                String.valueOf(Constants.survey_id), selected_option,
                getSharedPreferences("PREFERENCE", MODE_PRIVATE).
                        getString("tablet_uuid", ""), followup_question_id,""};
        new InternetHelper(Remarks.this).execute(stringrray);

        btn_submit_remarks.setVisibility(View.GONE);
        progressBar_remarkScreen.setVisibility(View.VISIBLE);
    }


    private void addResponseIncrement(){
        String inc_emp_id=getSharedPreferences("PREFERENCE", MODE_PRIVATE).
                getString("inc_emp_id", "");
        Log.e("initial_counter_id",inc_emp_id);
        if(inc_emp_id.equals("")){
            inc_emp_id="1";
        }
//        String inc_emp_name="User"+inc_emp_id;
               String inc_emp_name="Utkarsh";

        String comment = editText_remarks.getText().toString();
        String[] stringrray = new String[]{Constants.base_url + "xp_android/add_response_increment", "add_response", "", "",
                "", "", String.valueOf(rating), comment,
                Constants.emp_id.toString(),
                String.valueOf(Constants.survey_id), selected_option,
                getSharedPreferences("PREFERENCE", MODE_PRIVATE).
                        getString("tablet_uuid", ""), followup_question_id,Constants.emp_id.toString()};
        Constants.emp_name=inc_emp_name;
        new InternetHelper(Remarks.this).execute(stringrray);
        btn_submit_remarks.setVisibility(View.GONE);
        progressBar_remarkScreen.setVisibility(View.VISIBLE);
    }

    public void RecordInserted(){
        String inc_emp_id=getSharedPreferences("PREFERENCE", MODE_PRIVATE).
                getString("inc_emp_id", "");
        btn_submit_remarks.setVisibility(View.VISIBLE);
        progressBar_remarkScreen.setVisibility(View.GONE);
        Survey_MultiOption.instance.CallingFromSurvery_MultiOption = false;
        handler.removeMessages(0);
        if(inc_emp_id.equals("")){
            res_counter=1;
        }else{
            res_counter= Integer.parseInt(getSharedPreferences("PREFERENCE", MODE_PRIVATE).
                    getString("inc_emp_id", ""));
        }

        res_counter++;
        Log.e("counter",String.valueOf(res_counter));
        getSharedPreferences("PREFERENCE", MODE_PRIVATE).edit()
                .putString("inc_emp_id", String.valueOf(res_counter)).commit();
        Intent i = new Intent(Remarks.this, ThankYouPage.class);
        startActivity(i);
    }

    @Override
    protected void onPause() {
        super.onPause();
        ActivityManager activityManager = (ActivityManager) getApplicationContext()
                .getSystemService(Context.ACTIVITY_SERVICE);
        activityManager.moveTaskToFront(getTaskId(), 0);
    }

    public void showSnackBar(String message){
        progressBar_remarkScreen.setVisibility(View.GONE);
        btn_submit_remarks.setVisibility(View.VISIBLE);
        final Snackbar snackbar = Snackbar.make(coordinatorLayout_remarks, message,
                Snackbar.LENGTH_INDEFINITE)
                .setAction("Retry", new View.OnClickListener() {
                    @Override
                    public void onClick(View view) {
                       // addResponse();
                        addResponseIncrement();
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


    public void hideKeyboard(View view) {
        InputMethodManager inputMethodManager =(InputMethodManager)getSystemService(Activity.INPUT_METHOD_SERVICE);
        inputMethodManager.hideSoftInputFromWindow(view.getWindowToken(), 0);
    }


    @Override
    protected void onUserLeaveHint()
    {
        handler.removeMessages(0);
    }
}
