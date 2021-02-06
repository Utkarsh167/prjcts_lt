package graymars.feedibk.com.myapplication.Activities;

import android.Manifest;
import android.app.ActivityManager;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.content.res.AssetManager;
import android.graphics.Color;
import android.graphics.Typeface;
import android.os.PowerManager;
import android.provider.Settings;
import android.support.design.widget.CoordinatorLayout;
import android.support.design.widget.Snackbar;
import android.support.design.widget.TabLayout;
import android.support.v4.app.ActivityCompat;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.telephony.TelephonyManager;
import android.util.Log;
import android.view.KeyEvent;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.view.inputmethod.InputMethodManager;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

//import com.android.volley.AuthFailureError;
//import com.android.volley.Request;
//import com.android.volley.Response;
//import com.android.volley.VolleyError;
//import com.android.volley.VolleyLog;
//import com.android.volley.toolbox.JsonObjectRequest;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

//import graymars.feedibk.com.myapplication.Application.AppController;
import graymars.feedibk.com.myapplication.Constants;
import graymars.feedibk.com.myapplication.R;
import graymars.feedibk.com.myapplication.Services.InternetHelper;

public class LoginActivity extends AppCompatActivity implements View.OnClickListener {

    TextView textView_tagLine;
    Button btn_login;
    private static final int REQUEST_READ_PHONE_STATE = 101;
    EditText editText_userName, editText_password;
    public static LoginActivity instance;
    CoordinatorLayout coordinatorLayout_loginActivity;
    ProgressBar progessBar_loginActivity;
    String deviceUniqueIdentifier = null;
    TelephonyManager tm;
    Button test_button;
    Context context;


    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        //wake lock
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        PowerManager powerManager = (PowerManager) getSystemService(POWER_SERVICE);
        PowerManager.WakeLock wakeLock = powerManager.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "MyApp::MyWakelockTag");
        wakeLock.acquire();
        context=this;
        try {
           // getWindow().addFlags(WindowManager.LayoutParams.TYPE_SYSTEM_OVERLAY);
            requestWindowFeature(Window.FEATURE_NO_TITLE);
            getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN, WindowManager.LayoutParams.FLAG_FULLSCREEN);
            setContentView(R.layout.activity_login);
            tm = (TelephonyManager) this.getSystemService(Context.TELEPHONY_SERVICE);

            instance = this;
            getDeviceIMEI();
            textView_tagLine = findViewById(R.id.textView_tagLine);
            //textView_AppName = findViewById(R.id.textView_AppName);
            btn_login = findViewById(R.id.btn_login);
            editText_password = findViewById(R.id.editText_password);
            editText_userName = findViewById(R.id.editText_userName);
            coordinatorLayout_loginActivity = findViewById(R.id.coordinatorLayout_loginActivity);
            progessBar_loginActivity = findViewById(R.id.progessBar_loginActivity);
            test_button=findViewById(R.id.test_button);

            test_button.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View view) {
                    Log.e("LOGIN","in test");
                    Toast.makeText(LoginActivity.this, "In on click test", Toast.LENGTH_SHORT).show();
                }
            });
            btn_login.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View view) {
                    if (editText_userName.getText().toString().equals(""))
                    {
                        Toast.makeText(context, "Please enter your username to continue", Toast.LENGTH_SHORT).show();
                    }
                    else if(editText_password.getText().toString().equals(""))
                    {
                        Toast.makeText(context, "Please enter your passsword to continue", Toast.LENGTH_SHORT).show();
                    }
                    else{
                        ((InputMethodManager)getSystemService(Context.INPUT_METHOD_SERVICE))
                                .hideSoftInputFromWindow(editText_userName.getWindowToken(), 0);
                        checkLogin();
                    }
                }
            });
            editText_userName.setOnClickListener(this);
            editText_password.setOnClickListener(this);

            AssetManager am = getApplicationContext().getAssets();

            Typeface typeface_logo = Typeface.createFromAsset(am,
                    String.format(Locale.US, "fonts/%s", "segoeui_nrml.ttfl.ttf"));

            // textView_AppName.setTypeface(typeface_logo);
           // textView_tagLine.setTypeface(typeface_logo);

//            btn_login.setOnClickListener(this);

        } catch (Exception e){
            System.out.print(e);
        }
    }

    @Override
    public void onClick(View view) {
        if(view.getId()==R.id.btn_login)
        {
          // checkLogin();
            //
            if (editText_userName.getText().toString().equals(""))
            {
                Toast.makeText(this, "Please enter your username to continue", Toast.LENGTH_SHORT).show();
            }
            else if(editText_password.getText().toString().equals(""))
            {
                Toast.makeText(this, "Please enter your passsword to continue", Toast.LENGTH_SHORT).show();
            }
            else{
                ((InputMethodManager)getSystemService(Context.INPUT_METHOD_SERVICE))
                        .hideSoftInputFromWindow(editText_userName.getWindowToken(), 0);
                checkLogin();
            }
        }
//        else if(view.getId()==R.id.test_button){
//            Toast.makeText(instance, "button clicked", Toast.LENGTH_SHORT).show();
//        }
        else if(view.getId()==R.id.editText_userName)
        {
            ((InputMethodManager)getSystemService(Context.INPUT_METHOD_SERVICE))
                    .showSoftInput(editText_userName, InputMethodManager.SHOW_FORCED);
        }
        else if(view.getId()==R.id.editText_password)
        {
            ((InputMethodManager)getSystemService(Context.INPUT_METHOD_SERVICE))
                    .showSoftInput(editText_password, InputMethodManager.SHOW_FORCED);
        }
    }

    private void checkLogin(){
        progessBar_loginActivity.setVisibility(View.VISIBLE);
        btn_login.setVisibility(View.GONE);
//        String url="http://192.168.0.131/feediback_backend/index.php/xp_android/admin_login";
//        String tag_json_obj = "json_obj_req";
//        JsonObjectRequest jsonObjReq = new JsonObjectRequest(Request.Method.POST,
//                url, null,
//                new Response.Listener<JSONObject>() {
//
//                    @Override
//                    public void onResponse(JSONObject response) {
//                        Log.d("LOGINACT", response.toString());
//                        //pDialog.hide();
//                    }
//                }, new Response.ErrorListener() {
//
//            @Override
//            public void onErrorResponse(VolleyError error) {
//                VolleyLog.d("LOGINACT", "Error: " + error.getMessage());
//              //  pDialog.hide();
//            }
//        }) {
//
//            @Override
//            protected Map<String, String> getParams() {
//                Map<String, String> params = new HashMap<String, String>();
//                params.put("client_email", editText_userName.getText().toString().trim());
//                params.put("email", "abc@androidhive.info");
//                params.put("client_password", editText_password.getText().toString().trim());
//
//                return params;
//            }
//
//            @Override
//            public Map<String, String> getHeaders() throws AuthFailureError {
//                HashMap<String, String> headers = new HashMap<String, String>();
//                headers.put("Content-Type", "application/json");
//                headers.put("x-api-key", "123456");
//                return headers;
//            }
//
//
//        };
//
//        AppController.getInstance().addToRequestQueue(jsonObjReq, tag_json_obj);

        Toast.makeText(instance, "Login", Toast.LENGTH_SHORT).show();

        String[] stringrray = new String[]{Constants.base_url+"xp_android/admin_login",
                "login", editText_userName.getText().toString(),
                editText_password.getText().toString()};
        new InternetHelper(LoginActivity.this).execute(stringrray);
    }

    public void showSnackBar(String message){

        try {
            progessBar_loginActivity.setVisibility(View.GONE);
            btn_login.setVisibility(View.VISIBLE);
            final Snackbar snackbar = Snackbar.make(coordinatorLayout_loginActivity, message,
                    Snackbar.LENGTH_INDEFINITE)
                    .setAction("Retry", new View.OnClickListener() {
                        @Override
                        public void onClick(View view) {
                            checkLogin();
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

    public void loadMainScreen(JSONObject jsonObject){
        try {
            System.out.print(jsonObject);
            JSONObject data = jsonObject.getJSONObject("message");

            String location_id = data.getString("location_id");

            //System.out.print(location_id);

          //  JSONObject data_object = data.getJSONObject(0);
            //Constants.location_id = data.getInt("location_id");

            getSharedPreferences("PREFERENCE", MODE_PRIVATE).
                    edit().
                    putBoolean("loggedIn", true).
                    commit();

            getSharedPreferences("PREFERENCE", MODE_PRIVATE).
                    edit().
                    putString("location_id", location_id).
                    commit();


            getSharedPreferences("PREFERENCE", MODE_PRIVATE).
                    edit().
                    putString("admin_id", data.getString("id")).
                    commit();

            getSharedPreferences("PREFERENCE", MODE_PRIVATE).
                    edit().
                    putString("client_id", data.getString("client_id")).
                    commit();

             Intent i = new Intent(LoginActivity.this, TabletSettings.class);
             startActivity(i);
        }catch (Exception e)
        {
            System.out.print(e);
        }
    }

    @Override
    public void onBackPressed()
    {
        // do nothing;
    }

    @Override
    protected void onPause() {
        super.onPause();
        ActivityManager activityManager = (ActivityManager) getApplicationContext()
                .getSystemService(Context.ACTIVITY_SERVICE);
        activityManager.moveTaskToFront(getTaskId(), 0);
    }
/*
    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        boolean result;
        switch( event.getKeyCode() ) {

            case KeyEvent.KEYCODE_MENU:
                result = true;
                break;
            case KeyEvent.KEYCODE_VOLUME_UP:
                result = true;
                break;
            case KeyEvent.KEYCODE_VOLUME_DOWN:
                result = true;
                break;
            case KeyEvent.KEYCODE_BACK:
                result = true;
                break;
            default:
                result= super.dispatchKeyEvent(event);
                break;
        }
        return result;
    }*/

    public void getDeviceIMEI() {
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
            //deviceUniqueIdentifier = tm.getDeviceId();
        }
//        if (null == deviceUniqueIdentifier || 0 == deviceUniqueIdentifier.length()) {
//            deviceUniqueIdentifier = android.provider.Settings.Secure.getString(this.getContentResolver(), Settings.Secure.ANDROID_ID);
//        }
//        return deviceUniqueIdentifier;
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
}
