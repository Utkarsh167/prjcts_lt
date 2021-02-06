package graymars.feedibk.com.myapplication.Activities;

import android.app.ActivityManager;
import android.content.Context;
import android.content.Intent;
import android.graphics.Color;
import android.graphics.Typeface;
import android.os.Handler;
import android.os.PowerManager;
import android.support.design.widget.CoordinatorLayout;
import android.support.design.widget.Snackbar;
import android.support.v4.widget.SwipeRefreshLayout;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.view.ViewGroup;
import android.view.Window;
import android.view.WindowManager;
import android.view.inputmethod.InputMethodManager;
import android.widget.ImageView;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import org.json.JSONObject;

import de.hdodenhof.circleimageview.CircleImageView;
import graymars.feedibk.com.myapplication.Constants;
import graymars.feedibk.com.myapplication.R;
import graymars.feedibk.com.myapplication.Services.InternetHelper;

public class Feedback extends AppCompatActivity implements View.OnClickListener {

   // Button btn_submit;
    CircleImageView imageView_terrible, imageView_bad, imageView_okay, imageView_good, imageView_great;
    String category, subcategory, issue, option, multi_option;
    int rating=0;
    ProgressBar progressBar_feedback;
    public static Feedback instance;
    ImageView imageView_settings, imageView_backArrow_survey;
    Handler handler = new Handler();
    CoordinatorLayout coordinatorLayout_feedback;
    String followup_rating;
    TextView textView_title_feedback;
    int default_timer;
    SwipeRefreshLayout swipeRefreshLayout;
     Snackbar snackbar;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        //wake lock

        try {
            getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
            PowerManager powerManager = (PowerManager) getSystemService(POWER_SERVICE);
            PowerManager.WakeLock wakeLock = powerManager.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "MyApp::MyWakelockTag");
            wakeLock.acquire();

            //getWindow().addFlags(WindowManager.LayoutParams.TYPE_SYSTEM_OVERLAY);
            requestWindowFeature(Window.FEATURE_NO_TITLE);
            getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN, WindowManager.LayoutParams.FLAG_FULLSCREEN);
            setContentView(R.layout.activity_feedback);
            instance = this;
            default_timer = Integer.parseInt(getSharedPreferences("PREFERENCE", MODE_PRIVATE).getString("tablet_timer", ""));
            //swipeRefreshLayout = findViewById(R.id.swipeRefreshLayout);

            /*Set timeout of 30 seconds of inactivity*/
            handler.removeMessages(0);
//            if(Constants.welcome_message.equals("") && Constants.tagline.equals("")){
//
//            }else {
            if(!Constants.welcome_message.equals("")) {

                handler.postDelayed(new Runnable() {

                    @Override
                    public void run() {

                        try {
                            Constants.emp_id = null;
                            Constants.emp_name = null;
                            Constants.survey_id = null;
                            Constants.survey_name = null;
                            Intent i = new Intent(Feedback.this, WelcomeActivity.class);
                            startActivity(i);
                            handler.removeMessages(0);
                            finish();

                        } catch (Exception e) {
                            System.out.print(e);
                        }

                    }
                }, default_timer * 1000 * 60);
            }
            //}

//            swipeRefreshLayout.setOnRefreshListener(new SwipeRefreshLayout.OnRefreshListener() {
//                @Override
//                public void onRefresh() {
//                    getSurveyDetails();
//                }
//            });

           // getSurveyDetails();

            textView_title_feedback = findViewById(R.id.textView_title_feedback);

            textView_title_feedback.setText(Constants.master_question);

            coordinatorLayout_feedback = findViewById(R.id.coordinatorLayout_feedback);
            imageView_backArrow_survey = findViewById(R.id.imageView_backArrow_survey);
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

            imageView_terrible.setOnClickListener(this);
            imageView_bad.setOnClickListener(this);
            imageView_okay.setOnClickListener(this);
            imageView_good.setOnClickListener(this);
            imageView_great.setOnClickListener(this);

          //  btn_submit = findViewById(R.id.btn_submit);
          //  btn_submit.setOnClickListener(this);
        }catch (Exception e)
        {
            System.out.print(e);
        }
    }

    private void getSurveyDetails(){
        progressBar_feedback.setVisibility(View.VISIBLE);
       // btn_getStarted.setVisibility(View.GONE);
        String[] stringrray = new String[]{Constants.base_url+"xp_android/get_survey_details", "getSurvey",
                getSharedPreferences("PREFERENCE", MODE_PRIVATE).getString("tablet_id","")};
        new InternetHelper(Feedback.this).execute(stringrray);
        //  String[] stringrray = new String[]{Constants.base_url+"get_campaign.php", "get_campaign"};
        //  new InternetHelper(WelcomeActivity.this).execute(stringrray);
    }

    public void loadCampaignName(JSONObject jsonObject){

        try {
            swipeRefreshLayout.setRefreshing(false);
            progressBar_feedback.setVisibility(View.GONE);
           // btn_getStarted.setVisibility(View.VISIBLE);
            //textView_campaignName.setText(jsonObject.getString("welcome_message"));
            //textView_description.setText(jsonObject.getString("tagline"));
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
    public void onClick(View view) {

        if(view.getId()==R.id.imageView_terrible)
        {
            Log.e("FEEDBACK","on terrible clicked");
            imageView_terrible.setBorderWidth(5);
            imageView_bad.setBorderWidth(0);
            imageView_okay.setBorderWidth(0);
            imageView_good.setBorderWidth(0);
            imageView_great.setBorderWidth(0);
            rating =1;
            followup_rating = "negative";
            if(Constants.followup_question.equals("")) {
                if (Constants.followup_question_negative.equals(""))
                {
                    loadRemarksScreen("", "", "", "", "",
                            "","","",rating);
                }
                else{
                    loadMultiOptionScreen(Constants.followup_question_negative, Constants.followup_question_negative_id,
                            Constants.option_1_negative, Constants.option_2_negative, Constants.option_3_negative,
                            Constants.option_4_negative, Constants.option_5_negative, Constants.option_6_negative,
                            rating, followup_rating);
                }
            }
            else{
                loadMultiOptionScreen(Constants.followup_question, Constants.followup_question_id,
                        Constants.option_1, Constants.option_2, Constants.option_3,
                        Constants.option_4, Constants.option_5, Constants.option_6,
                        rating, followup_rating);
            }
          //  getFollowupQuestionDetails("negative");

        }
        else if(view.getId()==R.id.imageView_bad)
        {
            imageView_terrible.setBorderWidth(0);
            imageView_bad.setBorderWidth(5);
            imageView_okay.setBorderWidth(0);
            imageView_good.setBorderWidth(0);
            imageView_great.setBorderWidth(0);
            rating =2;
           // getFollowupQuestionDetails("negative");
            followup_rating = "negative";
            if(Constants.followup_question.equals("")) {
                if (Constants.followup_question_negative.equals(""))
                {
                    loadRemarksScreen("", "", "", "", "",
                            "","","",rating);
                }
                else{
                    loadMultiOptionScreen(Constants.followup_question_negative, Constants.followup_question_negative_id,
                            Constants.option_1_negative, Constants.option_2_negative, Constants.option_3_negative,
                            Constants.option_4_negative, Constants.option_5_negative, Constants.option_6_negative,
                            rating, followup_rating);
                }
            }
            else{
                loadMultiOptionScreen(Constants.followup_question, Constants.followup_question_id,
                        Constants.option_1, Constants.option_2, Constants.option_3,
                        Constants.option_4, Constants.option_5, Constants.option_6,
                        rating, followup_rating);
            }
        }
        else if(view.getId() == R.id.imageView_okay)
        {
            imageView_terrible.setBorderWidth(0);
            imageView_bad.setBorderWidth(0);
            imageView_okay.setBorderWidth(5);
            imageView_good.setBorderWidth(0);
            imageView_great.setBorderWidth(0);
            rating=3;
           // getFollowupQuestionDetails("neutral");
            followup_rating = "neutral";
            if(Constants.followup_question.equals("")) {
                if (Constants.followup_question_neutral.equals(""))
                {
                    loadRemarksScreen("", "", "", "", "",
                            "","","",rating);
                }
                else{
                    loadMultiOptionScreen(Constants.followup_question_neutral, Constants.followup_question_neutral_id,
                            Constants.option_1_neutral, Constants.option_2_neutral, Constants.option_3_neutral,
                            Constants.option_4_neutral, Constants.option_5_neutral, Constants.option_6_neutral,
                            rating, followup_rating);
                }
            }
            else{
                loadMultiOptionScreen(Constants.followup_question, Constants.followup_question_id,
                        Constants.option_1, Constants.option_2, Constants.option_3,
                        Constants.option_4, Constants.option_5, Constants.option_6,
                        rating, followup_rating);
            }
        }
        else if(view.getId() == R.id.imageView_good)
        {
            imageView_terrible.setBorderWidth(0);
            imageView_bad.setBorderWidth(0);
            imageView_okay.setBorderWidth(0);
            imageView_good.setBorderWidth(5);
            imageView_great.setBorderWidth(0);
            rating =4;
           // getFollowupQuestionDetails("positive");
            followup_rating ="positive";
            if(Constants.followup_question.equals("")) {
                if (Constants.followup_question_positive.equals(""))
                {
                    loadRemarksScreen("", "", "", "", "",
                            "","","",rating);
                }
                else{
                    loadMultiOptionScreen(Constants.followup_question_positive, Constants.followup_question_positive_id,
                            Constants.option_1_positive, Constants.option_2_positive, Constants.option_3_positive,
                            Constants.option_4_positive, Constants.option_5_positive, Constants.option_6_positive,
                            rating, followup_rating);
                }
            }
            else{
                loadMultiOptionScreen(Constants.followup_question, Constants.followup_question_id,
                        Constants.option_1, Constants.option_2, Constants.option_3,
                        Constants.option_4, Constants.option_5, Constants.option_6,
                        rating, followup_rating);
            }
        }
        else if(view.getId() == R.id.imageView_great)
        {
            imageView_terrible.setBorderWidth(0);
            imageView_bad.setBorderWidth(0);
            imageView_okay.setBorderWidth(0);
            imageView_good.setBorderWidth(0);
            imageView_great.setBorderWidth(5);
            rating =5;
          //  getFollowupQuestionDetails("positive");
            followup_rating = "positive";

            if(Constants.followup_question.equals("")) {
                if (Constants.followup_question_positive.equals(""))
                {
                    loadRemarksScreen("", "", "", "", "",
                            "","","",rating);
                }
                else{
                    loadMultiOptionScreen(Constants.followup_question_positive, Constants.followup_question_positive_id,
                            Constants.option_1_positive, Constants.option_2_positive, Constants.option_3_positive,
                            Constants.option_4_positive, Constants.option_5_positive, Constants.option_6_positive,
                            rating, followup_rating);
                }
            }
            else{
                loadMultiOptionScreen(Constants.followup_question, Constants.followup_question_id,
                        Constants.option_1, Constants.option_2, Constants.option_3,
                        Constants.option_4, Constants.option_5, Constants.option_6,
                        rating, followup_rating);
            }
        }
    }

    private void loadRemarksScreen(String followup_question, String followup_question_id,
                                   String option_1, String option_2, String option_3, String option_4,
                                   String option_5, String option_6, int rating){
        Intent i = new Intent(Feedback.this, Remarks.class);
        i.putExtra("followup_question", followup_question);
        i.putExtra("followup_question_id", "0");
        i.putExtra("option_1", option_1);
        i.putExtra("option_2", option_2);
        i.putExtra("option_3", option_3);
        i.putExtra("option_4", option_4);
        i.putExtra("option_5", option_5);
        i.putExtra("option_6", option_6);
        i.putExtra("rating_int", rating);
        i.putExtra("rating", String.valueOf(rating));
        i.putExtra("selected_option", "");
        startActivity(i);
    }

    private void loadMultiOptionScreen(String followup_question, String followup_question_id,
                                   String option_1, String option_2, String option_3, String option_4,
                                   String option_5, String option_6, int rating, String followup_rating){
        Intent i = new Intent(Feedback.this, Survey_MultiOption.class);
        i.putExtra("followup_question", followup_question);
        i.putExtra("followup_question_id", followup_question_id);
        i.putExtra("option_1", option_1);
        i.putExtra("option_2", option_2);
        i.putExtra("option_3", option_3);
        i.putExtra("option_4", option_4);
        i.putExtra("option_5",option_5);
        i.putExtra("option_6", option_6);
        i.putExtra("rating_int", rating);
        i.putExtra("rating", followup_rating);
        startActivity(i);
    }

  /*  private void getFollowupQuestionDetails(String rating){
        progressBar_feedback.setVisibility(View.VISIBLE);
        String[] stringrray = new String[]{Constants.base_url + "get_followup_question.php",
                "get_folloup_question",rating,
                String.valueOf(Constants.survey_id)};
        new InternetHelper(Feedback.this).execute(stringrray);
    }

    public void folloupDetailsFound(JSONObject jsonObject){
        try {
            JSONObject data = null;
            if (jsonObject.isNull("data")) {
                //jsonArray[1] is not null
                String[] stringrray = new String[]{Constants.base_url + "responses.php", "add_response", "", "",
                        "", "", String.valueOf(rating), "",
                        Constants.emp_id,
                        String.valueOf(Constants.survey_id), "",
                        getSharedPreferences("PREFERENCE", MODE_PRIVATE).getString("tablet_uuid", ""), ""};
                new InternetHelper(Feedback.this).execute(stringrray);
            } else {
                 data = jsonObject.getJSONObject("data");
                 String followup_question = data.getString("followup_question");
                 String followup_question_id = data.getString("followup_question_id");
                 String option_1 = data.getString("option_1");
                 String option_2 = data.getString("option_2");
                 String option_3 = data.getString("option_3");
                 String option_4 = data.getString("option_4");
                 String option_5 = data.getString("option_5");
                 String option_6 = data.getString("option_6");

                 Intent i = new Intent(Feedback.this, Survey_MultiOption.class);
                 i.putExtra("followup_question", followup_question);
                 i.putExtra("followup_question_id", followup_question_id);
                 i.putExtra("option_1", option_1);
                 i.putExtra("option_2", option_2);
                 i.putExtra("option_3", option_3);
                 i.putExtra("option_4", option_4);
                 i.putExtra("option_5", option_5);
                 i.putExtra("option_6", option_6);
                 i.putExtra("rating_int", rating);
                 i.putExtra("rating", followup_rating);
                 startActivity(i);
            }
        }catch (Exception e)
        {
            System.out.print(e);
        }
    }*/

    public void RecordInserted(){
        handler.removeMessages(0);
        Intent i = new Intent(Feedback.this, ThankYouPage.class);
        i.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
        startActivity(i);
    }

    public void dismissSnackBar(){
        if(snackbar!=null){
            snackbar.dismiss();
        }
    }

    /*
    private void update_response_multioption(){
        String[] stringrray = new String[]{Constants.base_url + "responses.php", "add_response", "", "",
                "", "", String.valueOf(rating), editText_feedback.getText().toString(),
                Constants.emp_id,
                String.valueOf(Constants.survey_id), multi_option,
        getSharedPreferences("PREFERENCE", MODE_PRIVATE).getString("tablet_uuid", "")};
        new InternetHelper(Feedback.this).execute(stringrray);
    }

    private void update_response(){
        //Toast.makeText(this, "Reached here", Toast.LENGTH_LONG).show();
        String[] stringrray = new String[]{Constants.base_url + "responses.php", "add_response", category, subcategory,
                issue, option, String.valueOf(rating), editText_feedback.getText().toString(),
                Constants.emp_id,
                String.valueOf(Constants.survey_id), "",
                getSharedPreferences("PREFERENCE", MODE_PRIVATE).getString("tablet_uuid", "")};

        new InternetHelper(Feedback.this).execute(stringrray);
    }


    public void RecordInserted(){
        handler.removeMessages(0);
        Intent i = new Intent(Feedback.this, ThankYouPage.class);
        startActivity(i);
    }*/

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

                     /*   if(Survey_MultiOption.instance.CallingFromSurvery_MultiOption)
                        {
                            update_response_multioption();
                        }
                        else {
                            update_response();
                        }*/
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

//    @Override
//    public void onBackPressed(){
////        if(Constants.welcome_message.equals("") && Constants.tagline.equals("")) {
////            // do nothing
////        }else{
//            super.onBackPressed();
//       // }
//    }

    @Override
    public void onBackPressed(){
        // do nothing
        if(!Constants.welcome_message.equals("")){
            super.onBackPressed();
            //Toast.makeText(instance, "in if "+Constants.welcome_message.equals(""), Toast.LENGTH_SHORT).show();
        }else{
           // Toast.makeText(instance, "in else "+Constants.welcome_message.equals(""), Toast.LENGTH_SHORT).show();

        }
    }

    private void overrideFonts(final Context context, final View v) {
        try {
            if (v instanceof ViewGroup) {
                ViewGroup vg = (ViewGroup) v;
                for (int i = 0; i < vg.getChildCount(); i++) {
                    View child = vg.getChildAt(i);
                    overrideFonts(context, child);
                }
            } else if (v instanceof TextView ) {
                ((TextView) v).setTypeface(Typeface.createFromAsset(context.getAssets(), "segoeui_nrml_nrml.ttf"));
            }
        } catch (Exception e) {
        }
    }

}

