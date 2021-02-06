package graymars.feedibk.com.myapplication.Activities;

import android.app.ActivityManager;
import android.app.ProgressDialog;
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
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.ProgressBar;
import android.widget.Spinner;
import android.widget.TextView;
import android.widget.Toast;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import graymars.feedibk.com.myapplication.Constants;
import graymars.feedibk.com.myapplication.R;
import graymars.feedibk.com.myapplication.Services.InternetHelper;

public class Survey extends AppCompatActivity {

    Spinner spinner_category, spinner_sub_category, spinner_issues, spinner_options;
    Button btn_continue;
    TextView textView_title_survey;
   // ProgressBar progressBar_survey;
    List<String> list = new ArrayList<String>();
    List<String> list_subcategory = new ArrayList<String>();
    List<String> list_issues = new ArrayList<String>();
    List<String> list_options = new ArrayList<String>();
    HashMap<String, Integer> hashMap_category = new HashMap<>();
    HashMap<String, Integer> hashMap_subcategory = new HashMap<>();
    HashMap<String, Integer> hashMap_issues = new HashMap<>();
    HashMap<String, String> hashMap_options = new HashMap<>();
    public static Survey instance;
    public static String identifier;
    ImageView imageView_settings, imageView_backArrow_survey;
    ProgressDialog progressDialog;
    String survey_name, survey_type;
    Handler handler = new Handler();
    int default_timer;
    public final String SURVEYTAG="SURVEYACT";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
       try {
           requestWindowFeature(Window.FEATURE_NO_TITLE);
           getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN, WindowManager.LayoutParams.FLAG_FULLSCREEN);
           setContentView(R.layout.activity_survey);
           instance = this;
//           getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);

//           PowerManager powerManager = (PowerManager) getSystemService(POWER_SERVICE);
//           PowerManager.WakeLock wakeLock = powerManager.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK,
//                   "MyApp::MyWakelockTag");
//           wakeLock.acquire();

           default_timer = Integer.parseInt(getSharedPreferences("PREFERENCE", MODE_PRIVATE).getString("tablet_timer", ""));

           /*Set timeout of 30 seconds of inactivity*/
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
                       Intent i = new Intent(Survey.this, WelcomeActivity.class);
                       i.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
                       startActivity(i);
                       finish();

                   }catch (Exception e)
                   {
                       e.printStackTrace();
                       uploadException(String.valueOf(Thread.currentThread().getStackTrace()[2].getLineNumber()),e.getMessage());

                   }

               }
           }, default_timer*1000*60);


           /*Timeout ends*/

           progressDialog = new ProgressDialog(this);

           Bundle b = getIntent().getExtras();
           String survey_question = b.getString("survey_question");

           list.clear();
           list_subcategory.clear();
           list_issues.clear();
           list_options.clear();

           list.add("Select Category");
           list_subcategory.add("Select Subcategory");
           list_issues.add("Select Issue");
           list_options.add("Select Option");

           textView_title_survey = findViewById(R.id.textView_title_survey);
           textView_title_survey.setText(survey_question);
           imageView_settings = findViewById(R.id.imageView_settings);
           imageView_settings.setOnClickListener(new View.OnClickListener() {
               @Override
               public void onClick(View view) {
                   Constants.showPasswordDialog(Survey.this, view);
                   ((InputMethodManager)getSystemService(Context.INPUT_METHOD_SERVICE))
                           .showSoftInput(getWindow().getDecorView(), InputMethodManager.SHOW_FORCED);
               }
           });

           imageView_backArrow_survey = findViewById(R.id.imageView_backArrow_survey);
           imageView_backArrow_survey.setOnClickListener(new View.OnClickListener() {
               @Override
               public void onClick(View view) {
                   handler.removeMessages(0);
                  // Survey.super.onBackPressed();
               }
           });

           spinner_category = findViewById(R.id.spinner_category);
           spinner_sub_category = findViewById(R.id.spinner_sub_category);
           spinner_issues = findViewById(R.id.spinner_issue);
           spinner_options = findViewById(R.id.spinner_options);

           spinner_category.setEnabled(false);
           spinner_category.setClickable(false);
           spinner_sub_category.setEnabled(false);
           spinner_sub_category.setClickable(false);
           spinner_issues.setEnabled(false);
           spinner_issues.setClickable(false);
           spinner_options.setEnabled(false);
           spinner_options.setClickable(false);

           spinner_category.setOnItemSelectedListener(new AdapterView.OnItemSelectedListener() {
               @Override
               public void onItemSelected(AdapterView<?> adapterView, View view, int position, long l) {
                  // Toast.makeText(Survey.this, "Clicked item" + String.valueOf(position), Toast.LENGTH_LONG).show();
                   if(position==0)
                   {

                   }
                   else {
                       identifier = "subcategory";
                       list_subcategory.clear();
                       list_issues.clear();
                       list_options.clear();
                       list_subcategory.add("Select Subcategory");
                       list_issues.add("Select Issue");
                       list_options.add("Select Option");
                       //spinner_category.getSelectedItem().toString();
                       getData("subcategory", hashMap_category.get(spinner_category.getSelectedItem().toString()));
                   }
               }
               @Override
               public void onNothingSelected(AdapterView<?> adapterView) {

               }
           });

           spinner_sub_category.setOnItemSelectedListener(new AdapterView.OnItemSelectedListener() {
               @Override
               public void onItemSelected(AdapterView<?> adapterView, View view, int position, long l) {
                   if(position==0)
                   {

                   }
                   else {
                       identifier = "issues";
                       list_issues.clear();
                       list_options.clear();
                       list_issues.add("Select Issue");
                       list_options.add("Select Option");
                       getData("issues", hashMap_subcategory.get(spinner_sub_category.getSelectedItem().toString()));
                   }
               }

               @Override
               public void onNothingSelected(AdapterView<?> adapterView) {

               }
           });

           spinner_issues.setOnItemSelectedListener(new AdapterView.OnItemSelectedListener() {
               @Override
               public void onItemSelected(AdapterView<?> adapterView, View view, int position, long l) {
                   if(position==0)
                   {

                   }
                   else {
                       spinner_options.setVisibility(View.GONE);
                       String haveOptions =  hashMap_options.get(spinner_issues.getSelectedItem().toString());
                       if(haveOptions.equals("Yes"))
                       {
                           list_options.clear();
                           list_options.add("Select Option");
                           identifier = "options";
                           getData("options", hashMap_issues.get(spinner_issues.getSelectedItem().toString()));
                       }
                       else{
                           // do nothing
                       }

                   }
               }

               @Override
               public void onNothingSelected(AdapterView<?> adapterView) {

               }
           });

           btn_continue = findViewById(R.id.btn_continue);
         //  progressBar_survey = findViewById(R.id.progressBar_survey);

           btn_continue.setOnClickListener(new View.OnClickListener() {
               @Override
               public void onClick(View view) {
                   if(spinner_category.getSelectedItem().toString().equals("Select Category"))
                   {
                       Toast.makeText(Survey.this,"Please select category to continue", Toast.LENGTH_SHORT).show();
                   }
                   else if(spinner_sub_category.getSelectedItem().toString().equals("Select Subcategory"))
                   {
                       Toast.makeText(Survey.this,"Please select subcategory to continue", Toast.LENGTH_SHORT).show();
                   }
                   else if(spinner_issues.getSelectedItem().toString().equals("Select Issue"))
                   {
                       Toast.makeText(Survey.this,"Please select issue to continue", Toast.LENGTH_SHORT).show();
                   }
                   else if(spinner_options.getVisibility()==View.VISIBLE)
                   {
                       if(spinner_options.getSelectedItem().toString().equals("Select Option"))
                       {
                           Toast.makeText(Survey.this,"Please select option to continue", Toast.LENGTH_SHORT).show();
                       }
                       else{
                          startFeedbackClass();
                       }
                   }
                   else {
                      startFeedbackClass();
                   }
               }
           });
           identifier="category";
           getData("category",0);
       }catch (Exception e)
       {
           e.printStackTrace();
           uploadException(String.valueOf(Thread.currentThread().getStackTrace()[2].getLineNumber()),e.getMessage());
       }
    }

    @Override
    public void onBackPressed(){


    }
    private void startFeedbackClass(){
        try {
            if(Survey_MultiOption.instance!=null)
            {
                Survey_MultiOption.instance.CallingFromSurvery_MultiOption = false;
            }
            handler.removeMessages(0);
            Intent i = new Intent(Survey.this, Feedback.class);
            i.putExtra("category", spinner_category.getSelectedItem().toString());
            i.putExtra("subcategory", spinner_sub_category.getSelectedItem().toString());
            i.putExtra("issue", spinner_issues.getSelectedItem().toString());
            if(spinner_options.getVisibility()==View.VISIBLE) {
                i.putExtra("option", spinner_options.getSelectedItem().toString());
            }
            else{
                i.putExtra("option","");
            }
            startActivity(i);
        }catch (Exception e)
        {
            e.printStackTrace();
            uploadException(String.valueOf(Thread.currentThread().getStackTrace()[2].getLineNumber()),e.getMessage());
        }
    }

    private void getData(String identifier, int id){

        progressDialog.setMessage("Please wait, fetching record...");
        progressDialog.show();
     //   progressBar_survey.setVisibility(View.VISIBLE);
       // btn_continue.setVisibility(View.GONE);
        String[] stringrray = null;
       if(identifier.equals("category")) {
           stringrray = new String[]{Constants.getBaseURL(Survey.this) + "survey.php",
                   "survey", identifier, String.valueOf(id),
                   String.valueOf(Constants.campaign_id)};
       }
       else
       {
           stringrray = new String[]{Constants.getBaseURL(Survey.this) + "survey.php", "survey", identifier, String.valueOf(id)};
       }
        new InternetHelper(Survey.this).execute(stringrray);
    }

    public void OnDataReceived(JSONObject jsonObject){
        try {
            progressDialog.dismiss();
           // progressBar_survey.setVisibility(View.GONE);
            btn_continue.setVisibility(View.VISIBLE);
            JSONArray data = null, survey=null;
            data = jsonObject.getJSONArray("data");

            /*if(identifier.equals("category"))
            {
                survey = jsonObject.getJSONArray("survey");
                if(survey.length()>0)
                {
                    for (int i = 0; i < survey.length(); i++) {
                        JSONObject survey_detail = survey.getJSONObject(i);
                        survey_name = survey_detail.getString("survey_question");
                        textView_title_survey.setText(survey_name);
                        survey_type = survey_detail.getString("survey_type");
                    }
                }
            }*/

            if (data.length() > 0) {
                for (int i = 0; i < data.length(); i++) {
                    JSONObject category_detail = data.getJSONObject(i);
                    String category_name = category_detail.getString("name");
                    int category_id = 0, subcategory_id=0, issue_id=0;
                    String options;
                    if(identifier.equals("category")) {
                        category_id = category_detail.getInt("category_id");
                        hashMap_category.put( category_name, category_id);
                        list.add(category_name);
                        ArrayAdapter<String> dataAdapter = new ArrayAdapter<String>(this,
                                android.R.layout.simple_spinner_item, list);
                        dataAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
                        spinner_category.setAdapter(dataAdapter);
                        spinner_category.setEnabled(true);
                        spinner_category.setClickable(true);
                    }
                    else if(identifier.equals("subcategory"))
                    {
                        subcategory_id = category_detail.getInt("subcategory_id");
                        hashMap_subcategory.put(category_name, subcategory_id);
                        list_subcategory.add(category_name);
                        ArrayAdapter<String> dataAdapter = new ArrayAdapter<String>(this,
                                android.R.layout.simple_spinner_item, list_subcategory);
                        dataAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
                        spinner_sub_category.setAdapter(dataAdapter);
                        spinner_sub_category.setEnabled(true);
                        spinner_sub_category.setClickable(true);
                    }
                    else if(identifier.equals("issues"))
                    {
                        issue_id = category_detail.getInt("issue_id");
                        options = category_detail.getString("options");
                        hashMap_options.put(category_name, options);
                        hashMap_issues.put(category_name, issue_id);
                        list_issues.add(category_name);
                        ArrayAdapter<String> dataAdapter = new ArrayAdapter<String>(this,
                                android.R.layout.simple_spinner_item, list_issues);
                        dataAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
                        spinner_issues.setAdapter(dataAdapter);
                        spinner_issues.setEnabled(true);
                        spinner_issues.setClickable(true);
                    }
                    else if(identifier.equals("options"))
                    {
                        list_options.add(category_name);
                        ArrayAdapter<String> dataAdapter = new ArrayAdapter<String>(this,
                                android.R.layout.simple_spinner_item, list_options);
                        dataAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
                        spinner_options.setAdapter(dataAdapter);
                        spinner_options.setEnabled(true);
                        spinner_options.setClickable(true);
                        spinner_options.setVisibility(View.VISIBLE);
                    }

                }
            }

        }catch (Exception e)
        {
            e.printStackTrace();
            uploadException(String.valueOf(Thread.currentThread().getStackTrace()[2].getLineNumber()),e.getMessage());
        }
    }

    public void showSnackBar(){
        Toast.makeText(this, "Trouble with internet. Please try again", Toast.LENGTH_LONG).show();
        handler.removeMessages(0);
        Intent i = new Intent(this, WelcomeActivity.class);
        i.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
        startActivity(i);
    }

    @Override
    protected void onPause() {
        super.onPause();
        ActivityManager activityManager = (ActivityManager) getApplicationContext()
                .getSystemService(Context.ACTIVITY_SERVICE);
        activityManager.moveTaskToFront(getTaskId(), 0);
    }

    public void uploadException(String line,String excep){
        try {
            String line_no = line;
            String exception = excep;
            String activity = SURVEYTAG;
            String[] stringrray = new String[]{Constants.getBaseURL(Survey.this) + "insert_exception.php", "add_exception",
                    line_no,
                    activity,
                    exception};
            new InternetHelper(Survey.this).execute(stringrray);
        }catch (Exception e){
            Log.e(SURVEYTAG,"in upload exception catch");
            e.printStackTrace();
        }

    }

    @Override
    protected void onUserLeaveHint()
    {
        handler.removeMessages(0);
    }
}
