package graymars.feedibk.com.myapplication.Activities;

import android.Manifest;
import android.app.Activity;
import android.app.ActivityManager;
import android.app.ProgressDialog;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.os.PowerManager;
import android.support.design.widget.CoordinatorLayout;
import android.support.design.widget.Snackbar;
import android.support.v4.app.ActivityCompat;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.telephony.TelephonyManager;
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

import java.util.UUID;

import graymars.feedibk.com.myapplication.Constants;
import graymars.feedibk.com.myapplication.R;
import graymars.feedibk.com.myapplication.Services.InternetHelper;

public class TabletSettings extends AppCompatActivity implements View.OnClickListener {

    private static final int REQUEST_READ_PHONE_STATE = 101;
    EditText editText_tabletName, editText_tabletLocation, editText_tabletArea;
    ProgressDialog progressDialog;
    Button btn_submit;
    public static TabletSettings instance;
    CoordinatorLayout coordinatorLayout_tableSettingsActivity;
    ImageView imageView_backArrow;
    String androidId;
    String deviceUniqueIdentifier = null;
    TelephonyManager tm;

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
            setContentView(R.layout.activity_tablet_settings);
            tm = (TelephonyManager) this.getSystemService(Context.TELEPHONY_SERVICE);

            instance = this;

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

            editText_tabletLocation.setVisibility(View.GONE);
            editText_tabletArea.setVisibility(View.GONE);

            btn_submit = findViewById(R.id.btn_submit);
            btn_submit.setOnClickListener(this);
            btn_submit.setEnabled(false);
            imageView_backArrow.setOnClickListener(this);

            checkIfTabletExist();

        } catch (Exception e) {
            System.out.print(e);
        }
    }

    private void checkIfTabletExist() {

        try {
            progressDialog.setMessage("Please wait, checking record...");
            progressDialog.show();
            androidId = getDeviceIMEI();
            //  String uuid = Constants.id(this);
            //Constants.id(this);
            String[] stringrray = new String[]{Constants.base_url + "xp_android/check_tablet", "check_tablet",
                    androidId};
            new InternetHelper(TabletSettings.this).execute(stringrray);
        } catch (Exception e) {
            System.out.print(e);
        }
    }

    @Override
    public void onClick(View view) {
        if (view.getId() == R.id.btn_submit) {
            if (editText_tabletName.getText().toString().equals("")) {
                Toast.makeText(this, "Please enter tablet name to continue", Toast.LENGTH_SHORT).show();
            } else {
                ((InputMethodManager) getSystemService(Context.INPUT_METHOD_SERVICE))
                        .hideSoftInputFromWindow(editText_tabletName.getWindowToken(), 0);
                addTabletEntryInDB();
            }
          /*  else if(editText_tabletLocation.getText().toString().equals(""))
            {
                Toast.makeText(this, "Please enter tablet location to continue", Toast.LENGTH_SHORT).show();
            }
            else if(editText_tabletArea.getText().toString().equals(""))
            {
                Toast.makeText(this, "Please enter tablet area to continue", Toast.LENGTH_SHORT).show();
            }*/

        } else if (view.getId() == R.id.editText_tabletName) {
            ((InputMethodManager) getSystemService(Context.INPUT_METHOD_SERVICE))
                    .showSoftInput(editText_tabletName, InputMethodManager.SHOW_FORCED);
        } else if (view.getId() == R.id.editText_tabletLocation) {
            ((InputMethodManager) getSystemService(Context.INPUT_METHOD_SERVICE))
                    .showSoftInput(editText_tabletLocation, InputMethodManager.SHOW_FORCED);
        } else if (view.getId() == R.id.editText_tabletArea) {
            ((InputMethodManager) getSystemService(Context.INPUT_METHOD_SERVICE))
                    .showSoftInput(editText_tabletArea, InputMethodManager.SHOW_FORCED);
        } else if (view.getId() == R.id.imageView_backArrow) {
            if (graymars.feedibk.com.myapplication.Activities.Settings.instance != null) {
                ((InputMethodManager) getSystemService(Context.INPUT_METHOD_SERVICE))
                        .hideSoftInputFromWindow(editText_tabletName.getWindowToken(), 0);
                super.onBackPressed();
            }
        }
    }

    private void addTabletEntryInDB() {
        progressDialog.setMessage("Please wait...");
        progressDialog.show();
        btn_submit.setVisibility(View.GONE);

        //  androidId = Settings.Secure.getString(getContentResolver(),
        //   Settings.Secure.ANDROID_ID);

        androidId = getDeviceIMEI();

        getSharedPreferences("PREFERENCE", MODE_PRIVATE)
                .edit()
                .putString("tablet_uuid", androidId)
                .commit();

        String admin_id=  getSharedPreferences("PREFERENCE", MODE_PRIVATE).getString("admin_id", "");
        String client_id=  getSharedPreferences("PREFERENCE", MODE_PRIVATE).getString("client_id", "");

        //Constants.id(this);
        String[] stringrray = new String[]{Constants.base_url + "xp_android/add_tablet", "add_tablet",
                editText_tabletName.getText().toString(),
                androidId,
                getSharedPreferences("PREFERENCE", MODE_PRIVATE).getString("location_id", ""),
                admin_id,
                client_id};
        new InternetHelper(TabletSettings.this).execute(stringrray);
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
            deviceUniqueIdentifier = Settings.Secure.getString(this.getContentResolver(), Settings.Secure.ANDROID_ID);
        }
        return deviceUniqueIdentifier;
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String permissions[], int[] grantResults) {
        switch (requestCode) {
            case REQUEST_READ_PHONE_STATE:
                if ((grantResults.length > 0) && (grantResults[0] == PackageManager.PERMISSION_GRANTED)) {
                    //TODO
                    getDeviceIMEI();
                }
                break;

            default:
                break;
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
            System.out.print(e);
        }
    }

    public void tabletExist(JSONObject jsonObject){

        try {
            progressDialog.dismiss();
            JSONObject data = jsonObject.getJSONObject("data");
            String tablet_id = data.getString("tablet_id");
            getSharedPreferences("PREFERENCE", MODE_PRIVATE).edit().
                    putString("tablet_id", data.getString("tablet_id")).commit();

            getSharedPreferences("PREFERENCE", MODE_PRIVATE).edit().putBoolean("tabletSettingsUpdated", true).commit();
            getSharedPreferences("PREFERENCE", MODE_PRIVATE)
                    .edit()
                    .putString("tablet_name", data.getString("tablet_name"))
                    .commit();

            getSharedPreferences("PREFERENCE", MODE_PRIVATE)
                    .edit()
                    .putString("tablet_uuid", androidId)
                    .commit();
            Intent i = new Intent(TabletSettings.this, WelcomeActivity.class);
            startActivity(i);
        }catch (Exception e)
        {
            System.out.print(e);
        }
       /* try {
            JSONArray data = jsonObject.getJSONArray("data");

            if (data.length() > 0) {
                for (int i = 0; i < data.length(); i++) {
                    JSONObject tablet_detail = data.getJSONObject(i);
                    editText_tabletName.setText(tablet_detail.getString("tablet_name"));
                    editText_tabletLocation.setText(tablet_detail.getString("tablet_location"));
                    editText_tabletArea.setText(tablet_detail.getString("tablet_area"));
                    Constants.area_id= tablet_detail.getInt("area_id");
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
            System.out.print(e);
        }*/
    }

    public void tabletAddedSuccessfully(JSONObject jsonObject){
        try {
        progressDialog.dismiss();
        System.out.print(jsonObject);


        String tab_id = String.valueOf(jsonObject.getInt("data"));
        //String tablet_id = data.getString("tablet_id");
        getSharedPreferences("PREFERENCE", MODE_PRIVATE).edit().
                    putString("tablet_id",tab_id).commit();

        getSharedPreferences("PREFERENCE", MODE_PRIVATE).edit().putBoolean("tabletSettingsUpdated", true).commit();
        getSharedPreferences("PREFERENCE", MODE_PRIVATE)
                    .edit()
                    .putString("tablet_name", editText_tabletName.getText().toString())
                    .commit();

        Intent i  = new Intent(TabletSettings.this, WelcomeActivity.class);
        startActivity(i);

        }catch (Exception e)
        {
            System.out.print(e);
        }
    }

    public void tabletNotFound() {
        progressDialog.dismiss();
        editText_tabletName.setEnabled(true);
       // editText_tabletLocation.setEnabled(true);
        //editText_tabletArea.setEnabled(true);
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
