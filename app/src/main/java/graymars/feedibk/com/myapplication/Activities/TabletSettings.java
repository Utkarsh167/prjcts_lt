package graymars.feedibk.com.myapplication.Activities;

import android.app.Activity;
import android.app.ActivityManager;
import android.app.ProgressDialog;
import android.content.Context;
import android.content.Intent;
import android.graphics.Color;
import android.os.PowerManager;
import android.support.design.widget.CoordinatorLayout;
import android.support.design.widget.Snackbar;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.view.inputmethod.InputMethodManager;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.TextView;
import android.widget.Toast;

import org.json.JSONArray;
import org.json.JSONObject;
import android.provider.Settings;

import java.util.Arrays;
import java.util.UUID;

import graymars.feedibk.com.myapplication.Constants;
import graymars.feedibk.com.myapplication.Helper.CryptLib;
import graymars.feedibk.com.myapplication.R;
import graymars.feedibk.com.myapplication.Services.InternetHelper;

public class TabletSettings extends AppCompatActivity implements View.OnClickListener {

    EditText editText_tabletName, editText_tabletLocation, editText_tabletArea;
    ProgressDialog progressDialog;
    Button btn_submit;
    public static TabletSettings instance;
    CoordinatorLayout coordinatorLayout_tableSettingsActivity;
    ImageView imageView_backArrow;
    CryptLib cryptLib;
    String androidId;


    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        try {
           // getWindow().addFlags(WindowManager.LayoutParams.TYPE_SYSTEM_OVERLAY);
            requestWindowFeature(Window.FEATURE_NO_TITLE);
            getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN, WindowManager.LayoutParams.FLAG_FULLSCREEN);
            setContentView(R.layout.activity_tablet_settings);
//            getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);

//            PowerManager powerManager = (PowerManager) getSystemService(POWER_SERVICE);
//            PowerManager.WakeLock wakeLock = powerManager.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK,
//                    "MyApp::MyWakelockTag");
//            wakeLock.acquire();


            instance = this;

//            String tablet_uuid_temp = getSharedPreferences("PREFERENCE",0).getString("tablet_uuid",null);
//            String decrypted = cryptLib.decryptCipherTextWithRandomIV(tablet_uuid_temp,Constants.key);
//            Log.i("DECRYPT",decrypted);
            cryptLib = new CryptLib();

            progressDialog = new ProgressDialog(this);
            coordinatorLayout_tableSettingsActivity = findViewById(R.id.coordinatorLayout_tableSettingsActivity);
            editText_tabletName = findViewById(R.id.editText_tabletName);
            editText_tabletLocation = findViewById(R.id.editText_tabletLocation);
            editText_tabletArea = findViewById(R.id.editText_tabletArea);
            imageView_backArrow = findViewById(R.id.imageView_backArrow);

            editText_tabletName.setEnabled(false);
            editText_tabletLocation.setEnabled(false);
            editText_tabletArea.setEnabled(false);

            editText_tabletName.setOnClickListener(this);
            editText_tabletLocation.setOnClickListener(this);
            editText_tabletArea.setOnClickListener(this);

            btn_submit = findViewById(R.id.btn_submit);
            btn_submit.setOnClickListener(this);
            btn_submit.setEnabled(false);
            imageView_backArrow.setOnClickListener(this);
             Constants.checkIfPermissionGranted(this);
            checkIfTabletExist();

        }catch (Exception e)
        {
            e.printStackTrace();
        }
    }

    private void checkIfTabletExist() {

        try {
            Log.i("TESTING",""+Constants.IMEI);
            progressDialog.setMessage("Please wait, checking record...");
            progressDialog.show();
        /*   androidId = Settings.Secure.getString(getContentResolver(),
                    Settings.Secure.ANDROID_ID); */
            androidId = Constants.IMEI; //get imei from Constatnts.class

            androidId = cryptLib.encryptPlainTextWithRandomIV(androidId,
                    Constants.key);

          //  String uuid = Constants.id(this);
            //Constants.id(this);
            String[] stringrray = new String[]{Constants.getBaseURL(TabletSettings.this) + "check_tablet.php", "check_tablet",
                    androidId};
            new InternetHelper(TabletSettings.this).execute(stringrray);
        }catch (Exception e)
        {
            e.printStackTrace();
        }
    }

    @Override
    public void onClick(View view) {
        if(view.getId() == R.id.btn_submit)
        {
            if(editText_tabletName.getText().toString().equals(""))
            {
                Toast.makeText(this, "Please enter tablet name to continue", Toast.LENGTH_SHORT).show();
            }
            else if(editText_tabletLocation.getText().toString().equals(""))
            {
                Toast.makeText(this, "Please enter tablet location to continue", Toast.LENGTH_SHORT).show();
            }
            else if(editText_tabletArea.getText().toString().equals(""))
            {
                Toast.makeText(this, "Please enter tablet area to continue", Toast.LENGTH_SHORT).show();
            }
            else {
                ((InputMethodManager)getSystemService(Context.INPUT_METHOD_SERVICE))
                        .hideSoftInputFromWindow(editText_tabletName.getWindowToken(), 0);
                addTabletEntryInDB();
            }
        }
        else if(view.getId() == R.id.editText_tabletName)
        {
            ((InputMethodManager)getSystemService(Context.INPUT_METHOD_SERVICE))
                    .showSoftInput(editText_tabletName, InputMethodManager.SHOW_FORCED);
        }
        else if(view.getId()==R.id.editText_tabletLocation)
        {
            ((InputMethodManager)getSystemService(Context.INPUT_METHOD_SERVICE))
                    .showSoftInput(editText_tabletLocation, InputMethodManager.SHOW_FORCED);
        }
        else if(view.getId() == R.id.editText_tabletArea)
        {
            ((InputMethodManager)getSystemService(Context.INPUT_METHOD_SERVICE))
                    .showSoftInput(editText_tabletArea, InputMethodManager.SHOW_FORCED);
        }
        else if(view.getId() == R.id.imageView_backArrow)
        {
            if(graymars.feedibk.com.myapplication.Activities.Settings.instance!=null)
            {
                ((InputMethodManager)getSystemService(Context.INPUT_METHOD_SERVICE))
                        .hideSoftInputFromWindow(editText_tabletName.getWindowToken(), 0);
                super.onBackPressed();
            }
        }
    }

    private void addTabletEntryInDB() {
            progressDialog.setMessage("Please wait...");
            progressDialog.show();
            btn_submit.setVisibility(View.GONE);

      /*    String androidId = Settings.Secure.getString(getContentResolver(),
               Settings.Secure.ANDROID_ID); */

        String androidId = Constants.IMEI; // get imei number from Constants.class (Shiva,27/2/2020:1:00pm)

            try {

                String tablet_name = cryptLib.encryptPlainTextWithRandomIV(editText_tabletName.getText().toString(),
                        Constants.key);
                String tablet_location = cryptLib.encryptPlainTextWithRandomIV(editText_tabletLocation.getText().toString(),
                        Constants.key);
                String tablet_Area = cryptLib.encryptPlainTextWithRandomIV(editText_tabletArea.getText().toString(),
                        Constants.key);

                androidId = cryptLib.encryptPlainTextWithRandomIV(androidId,
                        Constants.key);
//
                //  String uuid=  Constants.id(this);
                //Constants.id(this);
                String[] stringrray = new String[]{Constants.getBaseURL(TabletSettings.this) + "tablet.php", "add_tablet",
                        tablet_name,
                        tablet_location,
                        tablet_Area,
                        androidId};
                Log.i("UUID-Array", Arrays.toString(stringrray));

                new InternetHelper(TabletSettings.this).execute(stringrray);
            }catch (Exception e)
            {
                e.printStackTrace();
            }
    }

    @Override
    public void onBackPressed()
    {
        // do nothing;
    }

    public void showSnackBar(String message, final String identifier){

        try {
            progressDialog.dismiss();
            btn_submit.setVisibility(View.VISIBLE);
            final Snackbar snackbar = Snackbar.make(coordinatorLayout_tableSettingsActivity, message,
                    Snackbar.LENGTH_INDEFINITE)
                    .setAction("Retry", new View.OnClickListener() {
                        @Override
                        public void onClick(View view) {
                            if(identifier.equals("add_tablet")) {
                                addTabletEntryInDB();
                            }
                            else if(identifier.equals("check_tablet"))
                            {
                                checkIfTabletExist();
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

        }catch (Exception e)
        {
            e.printStackTrace();
        }
    }

    public void tabletExist(JSONObject jsonObject){

        progressDialog.dismiss();
        try {
            JSONArray data = jsonObject.getJSONArray("data");

            if (data.length() > 0) {
                for (int i = 0; i < data.length(); i++) {
                    JSONObject tablet_detail = data.getJSONObject(i);
                    editText_tabletName.setText(tablet_detail.getString("tablet_name"));
                    editText_tabletLocation.setText(tablet_detail.getString("tablet_location"));
                    editText_tabletArea.setText(tablet_detail.getString("tablet_area"));
                }
            }

            editText_tabletName.setEnabled(true);
            editText_tabletLocation.setEnabled(true);
            editText_tabletArea.setEnabled(true);
            btn_submit.setEnabled(true);
            btn_submit.setText("Update");
            Toast.makeText(this, "Tablet Exist.", Toast.LENGTH_SHORT).show();
        }catch (Exception e)
        {
            e.printStackTrace();
        }
    }

    public void tabletAddedSuccessfully(){
        progressDialog.dismiss();
        getSharedPreferences("PREFERENCE", MODE_PRIVATE).edit().putBoolean("tabletSettingsUpdated", true).commit();
        getSharedPreferences("PREFERENCE", MODE_PRIVATE)
                .edit()
                .putString("tablet_name", editText_tabletName.getText().toString())
                .commit();
        getSharedPreferences("PREFERENCE", MODE_PRIVATE)
                .edit()
                .putString("tablet_location", editText_tabletLocation.getText().toString())
                .commit();
        getSharedPreferences("PREFERENCE", MODE_PRIVATE)
                .edit()
                .putString("tablet_area", editText_tabletArea.getText().toString())
                .commit();
        getSharedPreferences("PREFERENCE", MODE_PRIVATE)
                .edit()
                .putString("tablet_uuid", androidId)
                .commit();

        Intent i  = new Intent(TabletSettings.this, WelcomeActivity.class);
        startActivity(i);
    }

    public void tabletNotFound() {
        progressDialog.dismiss();
        editText_tabletName.setEnabled(true);
        editText_tabletLocation.setEnabled(true);
        editText_tabletArea.setEnabled(true);
        btn_submit.setEnabled(true);
    }

    @Override
    protected void onPause() {
        super.onPause();
        ActivityManager activityManager = (ActivityManager) getApplicationContext()
                .getSystemService(Context.ACTIVITY_SERVICE);
        activityManager.moveTaskToFront(getTaskId(), 0);
    }
}
