package graymars.feedibk.com.myapplication.Activities;

import android.Manifest;
import android.annotation.SuppressLint;
import android.app.ActivityManager;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.content.res.AssetManager;
import android.graphics.Color;
import android.graphics.Typeface;
import android.os.Build;
import android.os.PowerManager;
import android.support.annotation.NonNull;
import android.support.annotation.RequiresApi;
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

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Locale;

import javax.crypto.NoSuchPaddingException;

import graymars.feedibk.com.myapplication.Constants;
import graymars.feedibk.com.myapplication.R;
import graymars.feedibk.com.myapplication.Services.InternetHelper;
import graymars.feedibk.com.myapplication.Helper.CryptLib;

import static java.sql.DriverManager.println;

public class LoginActivity extends AppCompatActivity implements View.OnClickListener {

    TextView textView_AppName, textView_tagLine;
    Button btn_login;
    EditText editText_userName, editText_password;
    public static LoginActivity instance;
    CoordinatorLayout coordinatorLayout_loginActivity;
    ProgressBar progessBar_loginActivity;
    CryptLib cryptLib = null;
    TelephonyManager telephonyManager;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        try {
            // getWindow().addFlags(WindowManager.LayoutParams.TYPE_SYSTEM_OVERLAY);
            requestWindowFeature(Window.FEATURE_NO_TITLE);
            getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN, WindowManager.LayoutParams.FLAG_FULLSCREEN);
            setContentView(R.layout.activity_login);

//            getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
//
//            PowerManager powerManager = (PowerManager) getSystemService(POWER_SERVICE);
//            PowerManager.WakeLock wakeLock = powerManager.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK,
//                    "MyApp::MyWakelockTag");
//            wakeLock.acquire();

            instance = this;
            textView_tagLine = findViewById(R.id.textView_tagLine);
            textView_AppName = findViewById(R.id.textView_AppName);
            btn_login = findViewById(R.id.btn_login);
            editText_password = findViewById(R.id.editText_password);
            editText_userName = findViewById(R.id.editText_userName);
            coordinatorLayout_loginActivity = findViewById(R.id.coordinatorLayout_loginActivity);
            progessBar_loginActivity = findViewById(R.id.progessBar_loginActivity);


            editText_userName.setOnClickListener(this);
            editText_password.setOnClickListener(this);

            //promt permission to get IMEI
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                if (ActivityCompat.checkSelfPermission(this, Manifest.permission.READ_PHONE_STATE) != PackageManager.PERMISSION_GRANTED) {
                    // TODO: Consider calling
                    //    ActivityCompat#requestPermissions
                    // here to request the missing permissions, and then overriding

                    if (ActivityCompat.shouldShowRequestPermissionRationale(this,
                            Manifest.permission.READ_PHONE_STATE)) {

                    } else {
                        ActivityCompat.requestPermissions(this,
                                new String[]{Manifest.permission.READ_PHONE_STATE},
                                1);
                        // MY_PERMISSIONS_REQUEST_READ_CONTACTS is an
                    }
                }

            }
            //check if permission is granted already
            Constants.checkIfPermissionGranted(this);


            AssetManager am = getApplicationContext().getAssets();
            Typeface typeface_logo = Typeface.createFromAsset(am,
                    String.format(Locale.US, "fonts/%s", "segoeui.ttf"));

            // textView_AppName.setTypeface(typeface_logo);
            textView_tagLine.setTypeface(typeface_logo);

            btn_login.setOnClickListener(this);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @RequiresApi(api = Build.VERSION_CODES.O)
    @Override
    public void onClick(View view) {
        if (view.getId() == R.id.btn_login) {
            // checkLogin();


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

    private void checkLogin() {
        progessBar_loginActivity.setVisibility(View.VISIBLE);
        btn_login.setVisibility(View.GONE);

        try {
           // cryptLib = new CryptLib();
           String cipherText = editText_password.getText().toString();
           // String string_to_be_converted_to_MD5 = editText_password.getText().toString();
           // String MD5_Hash_String = md5(string_to_be_converted_to_MD5);
          //  System.out.println(MD5_Hash_String);
           // String test = editText_password.getText().toString();
          //  String cipherText = cryptLib.encryptPlainTextWithRandomIV(editText_password.getText().toString(), Constants.key);

            String[] stringrray = new String[]{Constants.getBaseURL(LoginActivity.this) + "check_user.php", "login", editText_userName.getText().toString(),
                    cipherText};
            new InternetHelper(LoginActivity.this).execute(stringrray);
        }catch (Exception e)
        {
            e.printStackTrace();
        }

    }

    public String md5(String s) {
        try {
            // Create MD5 Hash
            MessageDigest digest = java.security.MessageDigest.getInstance("MD5");
            digest.update(s.getBytes());
            byte messageDigest[] = digest.digest();

            // Create Hex String
            StringBuffer hexString = new StringBuffer();
            for (int i=0; i<messageDigest.length; i++)
                hexString.append(Integer.toHexString(0xFF & messageDigest[i]));

            return hexString.toString();
        }catch (NoSuchAlgorithmException e) {
            e.printStackTrace();
        }
        return "";
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
            e.printStackTrace();
        }

    }

    public void loadMainScreen(){
        getSharedPreferences("PREFERENCE", MODE_PRIVATE).
                edit().
                putBoolean("loggedIn", true).
                apply();
        Intent i =  new Intent(LoginActivity.this, TabletSettings.class);
        startActivity(i);
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

    @SuppressLint("MissingPermission")
    @Override
    public void onRequestPermissionsResult(int requestCode,
                                           @NonNull String[] permissions, @NonNull int[] grantResults) {
        if (requestCode == 1) {// If request is cancelled, the result arrays are empty.
            if (grantResults.length > 0
                    && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                // permission was granted.
                 telephonyManager = (TelephonyManager) getSystemService(TELEPHONY_SERVICE);
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    //get IMEI Number
                    Constants.IMEI = telephonyManager.getImei();
                    Log.d("IMEI", telephonyManager.getImei());


                }

            } else {
                //Handle permission denied
            }
            return;

            // other 'case' lines to check for other
            // permissions this app might request.
        }
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
}
