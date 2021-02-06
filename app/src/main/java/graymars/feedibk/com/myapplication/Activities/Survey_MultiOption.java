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
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.widget.Button;
import android.widget.ImageView;
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
    String survey_id;
    public static Survey_MultiOption instance;
    String selected_option = null;
    public static boolean CallingFromSurvery_MultiOption = false;
    Handler handler = new Handler();

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        try {
           // getWindow().addFlags(WindowManager.LayoutParams.TYPE_SYSTEM_OVERLAY);
            requestWindowFeature(Window.FEATURE_NO_TITLE);
            getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN, WindowManager.LayoutParams.FLAG_FULLSCREEN);
            setContentView(R.layout.activity_survey__multi_option);

//            getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);

//            PowerManager powerManager = (PowerManager) getSystemService(POWER_SERVICE);
//            PowerManager.WakeLock wakeLock = powerManager.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK,
//                    "MyApp::MyWakelockTag");
//            wakeLock.acquire();

            instance = this;

        /*Set timeout of 10 minutes of inactivity*/

            handler.postDelayed(new Runnable() {

                @Override
                public void run() {

                    try {
                        Constants.emp_id = null;
                        Constants.emp_name = null;
                        Constants.survey_id = null;
                        Constants.survey_question = null;
                        handler.removeMessages(0);
                        Intent i = new Intent(Survey_MultiOption.this, WelcomeActivity.class);
                        i.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
                        startActivity(i);
                        //finish();

                    } catch (Exception e) {
                        e.printStackTrace();
                    }

                }
            }, 600000);

            progressDialog = new ProgressDialog(this);

            Bundle b = getIntent().getExtras();
            String survey_question = b.getString("survey_question");
            survey_id = b.getString("survey_id");

            btn_continue = findViewById(R.id.btn_continue);

            textView_title_survey = findViewById(R.id.textView_title_survey);
            textView_title_survey.setText(survey_question);
            textView_option1 = findViewById(R.id.textView_option1);
            textView_option2 = findViewById(R.id.textView_option2);
            textView_option3 = findViewById(R.id.textView_option3);
            textView_option4 = findViewById(R.id.textView_option4);
            textView_option5 = findViewById(R.id.textView_option5);
            textView_option6 = findViewById(R.id.textView_option6);

            imageView_option1 = findViewById(R.id.imageView_option1);
            imageView_option2 = findViewById(R.id.imageView_option2);
            imageView_option3 = findViewById(R.id.imageView_option3);
            imageView_option4 = findViewById(R.id.imageView_option4);
            imageView_option5 = findViewById(R.id.imageView_option5);
            imageView_option6 = findViewById(R.id.imageView_option6);
            imageView_backArrow_survey_multioption = findViewById(R.id.imageView_backArrow_survey_multioption);

            textView_option1.setOnClickListener(this);
            textView_option2.setOnClickListener(this);
            textView_option3.setOnClickListener(this);
            textView_option4.setOnClickListener(this);
            textView_option5.setOnClickListener(this);
            textView_option6.setOnClickListener(this);
            btn_continue.setOnClickListener(this);
            imageView_backArrow_survey_multioption.setOnClickListener(this);

            getData(survey_id);
        }catch (Exception e)
        {
            e.printStackTrace();
        }
    }

    private void getData(String survey_id) {

       // Toast.makeText(Survey_MultiOption.this, survey_id, Toast.LENGTH_SHORT).show();
        progressDialog.setMessage("Please wait, fetching record...");
        progressDialog.show();
        String[] stringrray = null;
            stringrray = new String[]{Constants.getBaseURL(Survey_MultiOption.this) + "survey_multioptions.php", "survey_multioptions",
                    survey_id};

        new InternetHelper(Survey_MultiOption.this).execute(stringrray);
    }


    public void surveyDetailsReceived(JSONObject jsonObject){
        try {
            progressDialog.dismiss();
            JSONArray data = jsonObject.getJSONArray("data");

            if (data.length() > 0) {
                for (int i = 0; i < data.length(); i++) {
                    JSONObject survey_detail = data.getJSONObject(i);
                    String Option1= survey_detail.getString("option_1");
                    String Option2= survey_detail.getString("option_2");
                    String Option3= survey_detail.getString("option_3");
                    String Option4= survey_detail.getString("option_4");
                    String Option5= survey_detail.getString("option_5");
                    String Option6= survey_detail.getString("option_6");

                    textView_option1.setText(Option1);
                    textView_option2.setText(Option2);
                    textView_option3.setText(Option3);
                    textView_option4.setText(Option4);
                    if(Option5.equals(""))
                    {
                        textView_option5.setVisibility(View.GONE);
                    }
                    else {
                        textView_option5.setText(Option5);
                    }
                    if(Option6.equals("")) {
                        textView_option6.setVisibility(View.GONE);
                    }
                    else{
                        textView_option6.setText(Option6);
                    }
                }
            }
        }catch (Exception e)
        {
            e.printStackTrace();
        }
    }

    @Override
    public void onClick(View view) {
        if(view.getId() == R.id.textView_option1)
        {
            selected_option = textView_option1.getText().toString();
            textView_option1.setBackgroundResource(R.drawable.rounded_background_options);
            imageView_option1.setVisibility(View.VISIBLE);

            textView_option2.setBackgroundResource(R.drawable.rounded_background);
            textView_option3.setBackgroundResource(R.drawable.rounded_background);
            textView_option4.setBackgroundResource(R.drawable.rounded_background);
            textView_option5.setBackgroundResource(R.drawable.rounded_background);
            textView_option6.setBackgroundResource(R.drawable.rounded_background);

            imageView_option2.setVisibility(View.GONE);
            imageView_option3.setVisibility(View.GONE);
            imageView_option4.setVisibility(View.GONE);
            imageView_option5.setVisibility(View.GONE);
            imageView_option6.setVisibility(View.GONE);
           // btn_continue.setText("Next");
        }
        else if(view.getId() == R.id.textView_option2)
        {
            selected_option = textView_option2.getText().toString();
            textView_option2.setBackgroundResource(R.drawable.rounded_background_options);
            imageView_option2.setVisibility(View.VISIBLE);

            textView_option1.setBackgroundResource(R.drawable.rounded_background);
            textView_option3.setBackgroundResource(R.drawable.rounded_background);
            textView_option4.setBackgroundResource(R.drawable.rounded_background);
            textView_option5.setBackgroundResource(R.drawable.rounded_background);
            textView_option6.setBackgroundResource(R.drawable.rounded_background);

            imageView_option1.setVisibility(View.GONE);
            imageView_option3.setVisibility(View.GONE);
            imageView_option4.setVisibility(View.GONE);
            imageView_option5.setVisibility(View.GONE);
            imageView_option6.setVisibility(View.GONE);
        }
        else if(view.getId() == R.id.textView_option3)
        {
            selected_option = textView_option3.getText().toString();
            textView_option3.setBackgroundResource(R.drawable.rounded_background_options);
            imageView_option3.setVisibility(View.VISIBLE);

            textView_option1.setBackgroundResource(R.drawable.rounded_background);
            textView_option2.setBackgroundResource(R.drawable.rounded_background);
            textView_option4.setBackgroundResource(R.drawable.rounded_background);
            textView_option5.setBackgroundResource(R.drawable.rounded_background);
            textView_option6.setBackgroundResource(R.drawable.rounded_background);

            imageView_option1.setVisibility(View.GONE);
            imageView_option2.setVisibility(View.GONE);
            imageView_option4.setVisibility(View.GONE);
            imageView_option5.setVisibility(View.GONE);
            imageView_option6.setVisibility(View.GONE);
        }
        else if(view.getId() == R.id.textView_option4)
        {
            selected_option = textView_option4.getText().toString();
            textView_option4.setBackgroundResource(R.drawable.rounded_background_options);
            imageView_option4.setVisibility(View.VISIBLE);

            textView_option1.setBackgroundResource(R.drawable.rounded_background);
            textView_option3.setBackgroundResource(R.drawable.rounded_background);
            textView_option2.setBackgroundResource(R.drawable.rounded_background);
            textView_option5.setBackgroundResource(R.drawable.rounded_background);
            textView_option6.setBackgroundResource(R.drawable.rounded_background);

            imageView_option1.setVisibility(View.GONE);
            imageView_option3.setVisibility(View.GONE);
            imageView_option2.setVisibility(View.GONE);
            imageView_option5.setVisibility(View.GONE);
            imageView_option6.setVisibility(View.GONE);
        }
        else if(view.getId() == R.id.textView_option5)
        {
            selected_option = textView_option5.getText().toString();
            textView_option5.setBackgroundResource(R.drawable.rounded_background_options);
            imageView_option5.setVisibility(View.VISIBLE);

            textView_option1.setBackgroundResource(R.drawable.rounded_background);
            textView_option3.setBackgroundResource(R.drawable.rounded_background);
            textView_option4.setBackgroundResource(R.drawable.rounded_background);
            textView_option2.setBackgroundResource(R.drawable.rounded_background);
            textView_option6.setBackgroundResource(R.drawable.rounded_background);

            imageView_option1.setVisibility(View.GONE);
            imageView_option3.setVisibility(View.GONE);
            imageView_option4.setVisibility(View.GONE);
            imageView_option2.setVisibility(View.GONE);
            imageView_option6.setVisibility(View.GONE);
        }
        else if(view.getId() == R.id.textView_option6)
        {
            selected_option = textView_option6.getText().toString();
            textView_option6.setBackgroundResource(R.drawable.rounded_background_options);
            imageView_option6.setVisibility(View.VISIBLE);

            textView_option1.setBackgroundResource(R.drawable.rounded_background);
            textView_option3.setBackgroundResource(R.drawable.rounded_background);
            textView_option4.setBackgroundResource(R.drawable.rounded_background);
            textView_option5.setBackgroundResource(R.drawable.rounded_background);
            textView_option2.setBackgroundResource(R.drawable.rounded_background);

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
                    Toast.makeText(Survey_MultiOption.this, "Please select an option to continue", Toast.LENGTH_SHORT).show();
                }
                else{
                    CallingFromSurvery_MultiOption = true;
                    handler.removeMessages(0);
                    Intent i = new Intent(Survey_MultiOption.this, Feedback.class);
                    i.putExtra("multioption", selected_option);
                    startActivity(i);
                }
            }catch (Exception e)
            {
                e.printStackTrace();
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

    @Override
    protected void onUserLeaveHint()
    {
        handler.removeMessages(0);
    }

}
