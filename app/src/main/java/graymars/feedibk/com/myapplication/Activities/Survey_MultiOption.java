package graymars.feedibk.com.myapplication.Activities;

import android.app.ActivityManager;
import android.app.ProgressDialog;
import android.content.Context;
import android.content.Intent;
import android.graphics.Color;
import android.os.Handler;
import android.os.PowerManager;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import org.json.JSONArray;
import org.json.JSONObject;

import graymars.feedibk.com.myapplication.Constants;
import graymars.feedibk.com.myapplication.R;
import graymars.feedibk.com.myapplication.Services.InternetHelper;

public class Survey_MultiOption extends AppCompatActivity implements View.OnClickListener {

    //#BBEBDF
    TextView textView_option1, textView_option2, textView_option3, textView_option4, textView_option5, textView_option6, textView_title_survey;
    ImageView imageView_option1, imageView_option2, imageView_option3,
            imageView_option4, imageView_option5, imageView_option6, imageView_backArrow_survey_multioption;
    Button btn_continue;
    ProgressDialog progressDialog;
    public static Survey_MultiOption instance;
    String selected_option = null;
    public static boolean CallingFromSurvery_MultiOption = false;
    Handler handler = new Handler();
    String followup_question , followup_question_id, option_1, option_2, option_3, option_4, option_5, option_6;
    int rating;
    int default_timer;
    ProgressBar progressBar_survey;
    int res_counter;

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
            setContentView(R.layout.activity_survey__multi_option);

            instance = this;

        /*Set timeout of 10 minutes of inactivity*/
            default_timer = Integer.parseInt(getSharedPreferences("PREFERENCE", MODE_PRIVATE).getString("tablet_timer", ""));



            handler.postDelayed(new Runnable() {

                @Override
                public void run() {

                    try {
                        Constants.emp_id = null;
                        Constants.emp_name = null;
                        Constants.survey_id = null;
                        Constants.survey_name = null;
                        Intent i = new Intent(Survey_MultiOption.this, WelcomeActivity.class);
                        startActivity(i);
                        finish();

                    } catch (Exception e) {
                        System.out.print(e);
                    }

                }
            }, default_timer*1000*60);

            progressDialog = new ProgressDialog(this);

            Bundle b = getIntent().getExtras();
            followup_question = b.getString("followup_question");
            followup_question_id = b.getString("followup_question_id");
            option_1 = b.getString("option_1");
            option_2 = b.getString("option_2");
            option_3 = b.getString("option_3");
            option_4 = b.getString("option_4");
            option_5 = b.getString("option_5");
            option_6 = b.getString("option_6");
            rating = b.getInt("rating_int");
            //rating_int = b.getInt("rating_int");

            btn_continue = findViewById(R.id.btn_continue);

            textView_title_survey = findViewById(R.id.textView_title_survey);
            textView_title_survey.setText(followup_question);
            textView_option1 = findViewById(R.id.textView_option1);
            textView_option1.setText("    A. "+option_1);
            textView_option2 = findViewById(R.id.textView_option2);
            textView_option2.setText("    B. "+option_2);
            textView_option3 = findViewById(R.id.textView_option3);
            textView_option3.setText("    C. "+option_3);
            textView_option4 = findViewById(R.id.textView_option4);
            textView_option4.setText("    D. "+option_4);
            textView_option5 = findViewById(R.id.textView_option5);
            textView_option5.setText("    E. "+option_5);
            textView_option6 = findViewById(R.id.textView_option6);
            textView_option6.setText("    F. "+option_6);

            imageView_option1 = findViewById(R.id.imageView_option1);
            imageView_option2 = findViewById(R.id.imageView_option2);
            imageView_option3 = findViewById(R.id.imageView_option3);
            imageView_option4 = findViewById(R.id.imageView_option4);
            imageView_option5 = findViewById(R.id.imageView_option5);
            imageView_option6 = findViewById(R.id.imageView_option6);
            imageView_backArrow_survey_multioption = findViewById(R.id.imageView_backArrow_survey_multioption);
            progressBar_survey=findViewById(R.id.progressBar_survey);

            textView_option1.setOnClickListener(this);
            textView_option2.setOnClickListener(this);
            textView_option3.setOnClickListener(this);
            textView_option4.setOnClickListener(this);
            textView_option5.setOnClickListener(this);
            textView_option6.setOnClickListener(this);
            btn_continue.setOnClickListener(this);
            imageView_backArrow_survey_multioption.setOnClickListener(this);

           // getData(survey_id);
        }catch (Exception e)
        {
            System.out.print(e);
        }
    }

    @Override
    public void onClick(View view) {
        if(view.getId() == R.id.textView_option1)
        {
            selected_option = option_1;
            textView_option1.setBackgroundResource(R.drawable.rounded_background);
           // imageView_option1.setVisibility(View.VISIBLE);

            textView_option2.setBackgroundResource(R.drawable.rounded_border_blue);
            textView_option3.setBackgroundResource(R.drawable.rounded_border_blue);
            textView_option4.setBackgroundResource(R.drawable.rounded_border_blue);
            textView_option5.setBackgroundResource(R.drawable.rounded_border_blue);
            textView_option6.setBackgroundResource(R.drawable.rounded_border_blue);

            imageView_option2.setVisibility(View.GONE);
            imageView_option3.setVisibility(View.GONE);
            imageView_option4.setVisibility(View.GONE);
            imageView_option5.setVisibility(View.GONE);
            imageView_option6.setVisibility(View.GONE);
           // btn_continue.setText("Next");
        }
        else if(view.getId() == R.id.textView_option2)
        {
            selected_option = option_2;
            textView_option2.setBackgroundResource(R.drawable.rounded_background);
          //  imageView_option2.setVisibility(View.VISIBLE);

            textView_option1.setBackgroundResource(R.drawable.rounded_border_blue);
            textView_option3.setBackgroundResource(R.drawable.rounded_border_blue);
            textView_option4.setBackgroundResource(R.drawable.rounded_border_blue);
            textView_option5.setBackgroundResource(R.drawable.rounded_border_blue);
            textView_option6.setBackgroundResource(R.drawable.rounded_border_blue);

            imageView_option1.setVisibility(View.GONE);
            imageView_option3.setVisibility(View.GONE);
            imageView_option4.setVisibility(View.GONE);
            imageView_option5.setVisibility(View.GONE);
            imageView_option6.setVisibility(View.GONE);
        }
        else if(view.getId() == R.id.textView_option3)
        {
            selected_option = option_3;
            textView_option3.setBackgroundResource(R.drawable.rounded_background);
           // imageView_option3.setVisibility(View.VISIBLE);

            textView_option1.setBackgroundResource(R.drawable.rounded_border_blue);
            textView_option2.setBackgroundResource(R.drawable.rounded_border_blue);
            textView_option4.setBackgroundResource(R.drawable.rounded_border_blue);
            textView_option5.setBackgroundResource(R.drawable.rounded_border_blue);
            textView_option6.setBackgroundResource(R.drawable.rounded_border_blue);

            imageView_option1.setVisibility(View.GONE);
            imageView_option2.setVisibility(View.GONE);
            imageView_option4.setVisibility(View.GONE);
            imageView_option5.setVisibility(View.GONE);
            imageView_option6.setVisibility(View.GONE);
        }
        else if(view.getId() == R.id.textView_option4)
        {
            selected_option = option_4;
            textView_option4.setBackgroundResource(R.drawable.rounded_background);
         //   imageView_option4.setVisibility(View.VISIBLE);

            textView_option1.setBackgroundResource(R.drawable.rounded_border_blue);
            textView_option3.setBackgroundResource(R.drawable.rounded_border_blue);
            textView_option2.setBackgroundResource(R.drawable.rounded_border_blue);
            textView_option5.setBackgroundResource(R.drawable.rounded_border_blue);
            textView_option6.setBackgroundResource(R.drawable.rounded_border_blue);

            imageView_option1.setVisibility(View.GONE);
            imageView_option3.setVisibility(View.GONE);
            imageView_option2.setVisibility(View.GONE);
            imageView_option5.setVisibility(View.GONE);
            imageView_option6.setVisibility(View.GONE);
        }
        else if(view.getId() == R.id.textView_option5)
        {
            selected_option = option_5;
            textView_option5.setBackgroundResource(R.drawable.rounded_background);
          //  imageView_option5.setVisibility(View.VISIBLE);

            textView_option1.setBackgroundResource(R.drawable.rounded_border_blue);
            textView_option3.setBackgroundResource(R.drawable.rounded_border_blue);
            textView_option4.setBackgroundResource(R.drawable.rounded_border_blue);
            textView_option2.setBackgroundResource(R.drawable.rounded_border_blue);
            textView_option6.setBackgroundResource(R.drawable.rounded_border_blue);

            imageView_option1.setVisibility(View.GONE);
            imageView_option3.setVisibility(View.GONE);
            imageView_option4.setVisibility(View.GONE);
            imageView_option2.setVisibility(View.GONE);
            imageView_option6.setVisibility(View.GONE);
        }
        else if(view.getId() == R.id.textView_option6)
        {
            selected_option = option_6;
            textView_option6.setBackgroundResource(R.drawable.rounded_background);
           // imageView_option6.setVisibility(View.VISIBLE);

            textView_option1.setBackgroundResource(R.drawable.rounded_border_blue);
            textView_option3.setBackgroundResource(R.drawable.rounded_border_blue);
            textView_option4.setBackgroundResource(R.drawable.rounded_border_blue);
            textView_option5.setBackgroundResource(R.drawable.rounded_border_blue);
            textView_option2.setBackgroundResource(R.drawable.rounded_border_blue);

            imageView_option1.setVisibility(View.GONE);
            imageView_option3.setVisibility(View.GONE);
            imageView_option4.setVisibility(View.GONE);
            imageView_option5.setVisibility(View.GONE);
            imageView_option2.setVisibility(View.GONE);
        }
        else if(view.getId() == R.id.btn_continue)
        {
            try {
                if(selected_option == null) {
                    Toast.makeText(Survey_MultiOption.this, "Please select an option to continue",
                            Toast.LENGTH_SHORT).show();
                }else if(Constants.remark_title.equals("")){
                    addResponseIncrement();
                }
                else{
                    CallingFromSurvery_MultiOption = true;
                  //  handler.removeMessages(0);
                    Intent i = new Intent(Survey_MultiOption.this, Remarks.class);
                    i.putExtra("followup_question", followup_question);
                    i.putExtra("followup_question_id", followup_question_id);
                    i.putExtra("option_1", option_1);
                    i.putExtra("option_2", option_2);
                    i.putExtra("option_3", option_3);
                    i.putExtra("option_4", option_4);
                    i.putExtra("option_5", option_5);
                    i.putExtra("option_6", option_6);
                    i.putExtra("rating_int", rating);
                    i.putExtra("rating", String.valueOf(rating));
                    i.putExtra("selected_option", selected_option);
                    startActivity(i);

                  /*  String[] stringrray = new String[]{Constants.base_url + "responses.php", "add_response", "", "",
                            "", "", String.valueOf(rating), "",
                            Constants.emp_id,
                            String.valueOf(Constants.survey_id), selected_option,
                            getSharedPreferences("PREFERENCE", MODE_PRIVATE).
                                    getString("tablet_uuid", ""), ""};
                    new InternetHelper(Survey_MultiOption.this).execute(stringrray);*/
                }
            }catch (Exception e)
            {
                System.out.print(e);
            }
        }
        else if(view.getId() == R.id.imageView_backArrow_survey_multioption)
        {
            handler.removeMessages(0);
            super.onBackPressed();
        }
    }


    @Override
    protected void onPause() {
        super.onPause();
        ActivityManager activityManager = (ActivityManager) getApplicationContext()
                .getSystemService(Context.ACTIVITY_SERVICE);
        activityManager.moveTaskToFront(getTaskId(), 0);
    }

    private void addResponse(){
        //String comment = editText_remarks.getText().toString();
        String[] stringrray = new String[]{Constants.base_url + "xp_android/add_response", "add_response", "", "",
                "", "", String.valueOf(rating), "",
                Constants.emp_id,
                String.valueOf(Constants.survey_id), selected_option,
                getSharedPreferences("PREFERENCE", MODE_PRIVATE).
                        getString("tablet_uuid", ""), followup_question_id,""};
        new InternetHelper(Survey_MultiOption.this).execute(stringrray);

       // btn_submit_remarks.setVisibility(View.GONE);
        progressBar_survey.setVisibility(View.VISIBLE);
    }


    private void addResponseIncrement(){
        String inc_emp_id=getSharedPreferences("PREFERENCE", MODE_PRIVATE).
                getString("inc_emp_id", "");
        Log.e("initial_counter_id",inc_emp_id);
        if(inc_emp_id.equals("")){
            inc_emp_id="1";
        }
        String inc_emp_name="User"+inc_emp_id;

        // String comment = editText_remarks.getText().toString();
        String[] stringrray = new String[]{Constants.base_url + "xp_android/add_response_increment", "add_response", "", "",
                "", "", String.valueOf(rating), "",
                inc_emp_id,
                String.valueOf(Constants.survey_id), selected_option,
                getSharedPreferences("PREFERENCE", MODE_PRIVATE).
                        getString("tablet_uuid", ""), followup_question_id,inc_emp_name};
        Constants.emp_name=inc_emp_name;
        new InternetHelper(Survey_MultiOption.this).execute(stringrray);
       // btn_submit_remarks.setVisibility(View.GONE);
        progressBar_survey.setVisibility(View.VISIBLE);
    }

    public void RecordInserted(){
        String inc_emp_id=getSharedPreferences("PREFERENCE", MODE_PRIVATE).
                getString("inc_emp_id", "");
       // btn_submit_remarks.setVisibility(View.VISIBLE);
        progressBar_survey.setVisibility(View.GONE);
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
        Intent i = new Intent(Survey_MultiOption.this, ThankYouPage.class);
        startActivity(i);
        finish();
    }

    @Override
    protected void onUserLeaveHint()
    {
        handler.removeMessages(0);
    }



}
