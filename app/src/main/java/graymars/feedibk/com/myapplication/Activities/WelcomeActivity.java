package graymars.feedibk.com.myapplication.Activities;

import android.Manifest;
import android.annotation.SuppressLint;
import android.app.ActionBar;
import android.app.Activity;
import android.app.ActivityManager;
import android.app.KeyguardManager;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothSocket;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.graphics.PixelFormat;
import android.media.Image;
import android.os.BatteryManager;
import android.os.Build;
import android.os.Handler;
import android.os.PowerManager;
import android.provider.*;
import android.support.annotation.NonNull;
import android.support.design.widget.CoordinatorLayout;
import android.support.design.widget.Snackbar;
import android.support.v4.app.ActivityCompat;
import android.support.v4.widget.SwipeRefreshLayout;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.telephony.TelephonyManager;
import android.util.Log;
import android.view.Gravity;
import android.view.LayoutInflater;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.view.inputmethod.InputMethodManager;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import graymars.feedibk.com.myapplication.Constants;
import graymars.feedibk.com.myapplication.Helper.CryptLib;
import graymars.feedibk.com.myapplication.R;
import graymars.feedibk.com.myapplication.Services.InternetHelper;
import graymars.feedibk.com.myapplication.customViewGroup;

import static android.view.View.SYSTEM_UI_FLAG_FULLSCREEN;
import static android.view.View.SYSTEM_UI_FLAG_HIDE_NAVIGATION;
import static android.view.View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY;
import static android.view.View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN;
import static android.view.View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION;
import static graymars.feedibk.com.myapplication.Constants.bluetoothConnected;

public class WelcomeActivity extends AppCompatActivity {

    Button btn_getStarted;
    public static WelcomeActivity instance;
    CoordinatorLayout coordinatorLayout_welcomeActivity;
    ProgressBar progressBar_welcomeActivity;
    TextView textView_campaignName, textView_description;
    ImageView imageView_settings;
    SwipeRefreshLayout swipeRefreshLayout;
    boolean loggedIn;

    boolean tabletSettingsUpdated;
    public final String WELCOMELOG = "WELCOMEACT";
    Context context;
    private BluetoothAdapter mBTAdapter;
    private Set<BluetoothDevice> mPairedDevices;
    HashMap<String, String> listPairedDevices = new HashMap<>();
    private final static int REQUEST_ENABLE_BT = 1; // used to identify adding bluetooth names
    private BluetoothSocket mBTSocket = null; // bi-directional client-to-client data path
    private static final UUID BTMODULEUUID = UUID.fromString("00001101-0000-1000-8000-00805F9B34FB"); // "random" unique identifier


    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        try {


            // Log.e(WELCOMELOG,"in on create");
             context=this;
            mBTAdapter = BluetoothAdapter.getDefaultAdapter(); // get a handle on the bluetooth radio

            //  getWindow().addFlags(WindowManager.LayoutParams.TYPE_SYSTEM_OVERLAY);

            Log.e(WELCOMELOG,getSharedPreferences("PREFERENCE", MODE_PRIVATE).getString("tablet_timer", ""));
            requestWindowFeature(Window.FEATURE_NO_TITLE);
            getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN, WindowManager.LayoutParams.FLAG_FULLSCREEN);
            setContentView(R.layout.activity_welcome);
//            getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
           //startLockTask();

            //startHandlerForBluetooth();

//            int test=19;
//            textView_campaignName.setText(test);



//            PowerManager powerManager = (PowerManager) getSystemService(POWER_SERVICE);
//            PowerManager.WakeLock wakeLock = powerManager.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK,
//                    "MyApp::MyWakelockTag");
//            wakeLock.acquire();

            Intent i;
            loggedIn = getSharedPreferences("PREFERENCE", MODE_PRIVATE).getBoolean("loggedIn", false);
            if (loggedIn) {
                tabletSettingsUpdated = getSharedPreferences("PREFERENCE", MODE_PRIVATE).
                        getBoolean("tabletSettingsUpdated", false);
                if(tabletSettingsUpdated)
                {
                    loadView();
                }
                else{
                    i = new Intent(WelcomeActivity.this, TabletSettings.class);
                    startActivity(i);
                }
            }
            else {
                getSharedPreferences("PREFERENCE", MODE_PRIVATE).edit()
                        .putString("ip_address", "http://13.126.106.225").commit();

//                getSharedPreferences("PREFERENCE", MODE_PRIVATE).edit()
//                        .putString("ip_address", "https://115.113.157.173").commit();


                getSharedPreferences("PREFERENCE", MODE_PRIVATE).edit()
                        .putString("tablet_timer", "60").commit();

                i = new Intent(WelcomeActivity.this, LoginActivity.class);
                startActivity(i);
            }

        }catch (Exception e)
        {
            uploadException(String.valueOf(Thread.currentThread().getStackTrace()[2].getLineNumber()),e.getMessage());
            e.printStackTrace();
            Log.e(WELCOMELOG,"in on create catch");
        }
    }

    private void startHandlerForBluetooth() {

        new Handler().postDelayed(new Runnable() {

            @Override
            public void run() {

                try {
                    Log.e(WELCOMELOG,"in start timer try");
                    checkBluetoothConnection();
                    listPairedDevices();
                    if(Constants.checkConnectedBluetoothDevices(context)){

                    }
                    else{
                        //Verification.instance.showSnackBar("Bluetooth Connection Failed.");
                    }
                    //connectToBluetoothDevice();
                } catch (Exception e) {
                    e.printStackTrace();
                    Log.e(WELCOMELOG,"in start timer catch");
                }

            }
        }, 30000);
    }


    private void listPairedDevices(){
        mPairedDevices = mBTAdapter.getBondedDevices();
        Log.e(WELCOMELOG,"in on listPairedDevices");
        if(mBTAdapter.isEnabled()) {
            // put it's one to the adapter
            Log.e(WELCOMELOG,"in on listPairedDevices if");
            for (BluetoothDevice device : mPairedDevices) {
                listPairedDevices.put(device.getName(), device.getAddress());
                Log.e(WELCOMELOG,"in on listPairedDevices if for");
                //  mBTArrayAdapter.add(device.getName() + "\n" + device.getAddress());
            }
          //  Toast.makeText(getApplicationContext(), "Show Paired Devices", Toast.LENGTH_SHORT).show();
        }
        else
            Log.e(WELCOMELOG,"in on listPairedDevices else");
     //   Toast.makeText(getApplicationContext(), "Bluetooth not on", Toast.LENGTH_SHORT).show();
    }

    private void checkBluetoothConnection() {
        if (!mBTAdapter.isEnabled()) {
            Log.e(WELCOMELOG,"in on checkBluetoothConnection if");
            bluetoothConnected = false;
            Intent enableBtIntent = new Intent(BluetoothAdapter.ACTION_REQUEST_ENABLE);
            startActivityForResult(enableBtIntent, REQUEST_ENABLE_BT);
           // Toast.makeText(getApplicationContext(), "Bluetooth not turned on", Toast.LENGTH_SHORT).show();

        } else {
            Log.e(WELCOMELOG,"in on checkBluetoothConnection else");
          //  Toast.makeText(getApplicationContext(), "Bluetooth is already on", Toast.LENGTH_SHORT).show();
        }
    }


    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent Data){
        // Check which request we're responding to
        if (requestCode == REQUEST_ENABLE_BT) {
            // Make sure the request was successful
            if (resultCode == RESULT_OK) {
                // The user picked a contact.
                Log.e(WELCOMELOG,"Bluetooth Enabled");
                // The Intent's data Uri identifies which contact was selected.
                //Toast.makeText(getApplicationContext(),"Bluetooth Enabled",Toast.LENGTH_SHORT).show();

            }
            else{
                Log.e(WELCOMELOG,"Bluetooth Disabled");
            }
               // Toast.makeText(getApplicationContext(),"Bluetooth Disabled",Toast.LENGTH_SHORT).show();

        }
    }



   /* private void connectToBluetoothDevice(){
        //progressDialog.setCancelable(false);
        try {

            if (!mBTAdapter.isEnabled()) {
                //Toast.makeText(getBaseContext(), "Bluetooth not on", Toast.LENGTH_SHORT).show();
                return;
            }

         //   Toast.makeText(this, "Connecting...", Toast.LENGTH_SHORT).show();


            String address = null, name = null;
            String ble_device_name = getSharedPreferences("PREFERENCE", MODE_PRIVATE)
                    .getString("bl_device_name", "");
            for (Map.Entry<String, String> entry : listPairedDevices.entrySet()) {

                name = entry.getKey();
                if (name.equals(ble_device_name) || name.equals(ble_device_name + " ")) {
                    address = entry.getValue();
                }
             *//*
             if(name.equals("HC-05") || name.equals("HC-05 ")) {
                 address = entry.getValue();
             }*//*
            }

            // Spawn a new thread to avoid blocking the GUI one
            final String finalAddress = address;
            final String finalName = name;
            if(address!=null) {
                new Thread() {
                    public void run() {
                        boolean fail = false;

                        BluetoothDevice device = mBTAdapter.getRemoteDevice(finalAddress);

                        try {
                            mBTSocket = createBluetoothSocket(device);
                            bluetoothConnected = true;
                        } catch (IOException e) {
                            fail = true;
                            Toast.makeText(getBaseContext(), "Socket creation failed", Toast.LENGTH_SHORT).show();
                            uploadException(String.valueOf(Thread.currentThread().getStackTrace()[2].getLineNumber()),e.getMessage());
                        }
                        // Establish the Bluetooth socket connection.
                        try {
                            mBTSocket.connect();
                        } catch (IOException e) {
                            try {
                                fail = true;
                                mBTSocket.close();
//                                mHandler.obtainMessage(CONNECTING_STATUS, -1, -1)
//                                        .sendToTarget();
                            } catch (IOException e2) {
                                //insert code to deal with this
                                Toast.makeText(getBaseContext(), "Socket creation failed", Toast.LENGTH_SHORT).show();
                                uploadException(String.valueOf(Thread.currentThread().getStackTrace()[2].getLineNumber()),e.getMessage());
                            }
                        }
                        if (fail == false) {
                            mConnectedThread = new Verification.ConnectedThread(mBTSocket);
                            mConnectedThread.start();

                            mHandler.obtainMessage(CONNECTING_STATUS, 1, -1, finalName)
                                    .sendToTarget();
                        }
                    }
                }.start();
            }
        }catch (Exception e)
        {
            e.printStackTrace();
            uploadException(String.valueOf(Thread.currentThread().getStackTrace()[2].getLineNumber()),e.getMessage());
        }
    }*/

    private BluetoothSocket createBluetoothSocket(BluetoothDevice device) throws IOException {
        return  device.createRfcommSocketToServiceRecord(BTMODULEUUID);
        //creates secure outgoing connection with BT device using UUID
    }


    private void loadView() {
        instance = this;
        btn_getStarted = findViewById(R.id.btn_getStarted);
        btn_getStarted.setVisibility(View.GONE);
        swipeRefreshLayout = findViewById(R.id.swipeRefreshLayout);
        coordinatorLayout_welcomeActivity = findViewById(R.id.coordinatorLayout_welcomeActivity);
        textView_campaignName = findViewById(R.id.textView_campaignName);
        textView_description = findViewById(R.id.textView_description);
        progressBar_welcomeActivity = findViewById(R.id.progressBar_welcomeActivity);
        btn_getStarted.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {

                Intent i = new Intent(WelcomeActivity.this, Verification.class);
                i.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
                startActivity(i);

              /*  if(Verification.instance!=null){
                    if(Constants.checkConnectedBluetoothDevices(WelcomeActivity.this)){
                        Intent i = new Intent(WelcomeActivity.this, Verification.instance.getClass());
                        startActivity(i);
                    }
                    else {
                        Intent i = new Intent(WelcomeActivity.this, Verification.class);
                        startActivity(i);
                    }
                }
                else {
                    Intent i = new Intent(WelcomeActivity.this, Verification.class);
                    startActivity(i);
                }*/
            }
        });

        imageView_settings = findViewById(R.id.imageView_settings);
        imageView_settings.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Constants.showPasswordDialog(WelcomeActivity.this, view);
                ((InputMethodManager)getSystemService(Context.INPUT_METHOD_SERVICE))
                        .showSoftInput(getWindow().getDecorView(), InputMethodManager.SHOW_FORCED);
            }
        });
        swipeRefreshLayout.setOnRefreshListener(new SwipeRefreshLayout.OnRefreshListener() {
            @Override
            public void onRefresh() {
                getCampaignName();
            }
        });

        getCampaignName();
      //  getBatteryPercentage(WelcomeActivity.this);

        // get battery status in every 15 mins
        startTimer();
    }

    // SEND TABLET DATA IN EVERY 1 HOUR
    private void startTimer() {

        new Handler().postDelayed(new Runnable() {

            @Override
            public void run() {

                try {getBatteryPercentage(WelcomeActivity.this);
                    Log.e(WELCOMELOG,"in start timer try");
                } catch (Exception e) {
                    e.printStackTrace();
                    Log.e(WELCOMELOG,"in start timer catch");
                }

            }
        }, 3600000);
    }

    private void getCampaignName(){
        progressBar_welcomeActivity.setVisibility(View.VISIBLE);
        btn_getStarted.setVisibility(View.GONE);
        String[] stringrray = new String[]{Constants.getBaseURL(WelcomeActivity.this)+"get_campaign.php", "get_campaign"};
        new InternetHelper(WelcomeActivity.this).execute(stringrray);
    }

    @Override
    public void onResume() {
        super.onResume();
        if(loggedIn) {
            if(tabletSettingsUpdated)
            getCampaignName();
        }
    }

    public void showSnackBar(String message){
        try {
            swipeRefreshLayout.setRefreshing(false);
            progressBar_welcomeActivity.setVisibility(View.GONE);
           // btn_getStarted.setVisibility(VI);
            final Snackbar snackbar = Snackbar.make(coordinatorLayout_welcomeActivity, message,
                    Snackbar.LENGTH_INDEFINITE)
                    .setAction("Retry", new View.OnClickListener() {
                        @Override
                        public void onClick(View view) {
                            getCampaignName();
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
    public void loadCampaignName(JSONObject jsonObject){
       try {
           swipeRefreshLayout.setRefreshing(false);
           progressBar_welcomeActivity.setVisibility(View.GONE);
           btn_getStarted.setVisibility(View.VISIBLE);
           JSONArray data = null;
           data = jsonObject.getJSONArray("data");

           if (data.length() > 0) {
               for (int i = 0; i < data.length(); i++) {
                   JSONObject campaign_detail = data.getJSONObject(i);
                   textView_campaignName.setText(campaign_detail.getString("name"));
                   textView_description.setText(campaign_detail.getString("description"));
                   Constants.campaign_id= campaign_detail.getInt("campaign_id");
               }
           }
       }catch (Exception e)
       {
           e.printStackTrace();
       }
    }

    @Override
    public void onBackPressed(){
        // do nothing
    }

    @Override
    protected void onPause() {
        super.onPause();
        ActivityManager activityManager = (ActivityManager) getApplicationContext()
                .getSystemService(Context.ACTIVITY_SERVICE);
        activityManager.moveTaskToFront(getTaskId(), 0);
    }

    public void getBatteryPercentage(Context context) {

        IntentFilter iFilter = new IntentFilter(Intent.ACTION_BATTERY_CHANGED);
        Intent batteryStatus = context.registerReceiver(null, iFilter);

        int level = batteryStatus != null ? batteryStatus.getIntExtra(BatteryManager.EXTRA_LEVEL, -1) : -1;
        int scale = batteryStatus != null ? batteryStatus.getIntExtra(BatteryManager.EXTRA_SCALE, -1) : -1;

        float batteryPct = level / (float) scale;

        int batteryPercentage = (int)(batteryPct*100);
        String androidId = android.provider.Settings.Secure.getString(getContentResolver(),
                android.provider.Settings.Secure.ANDROID_ID);

        String[] stringrray = new String[]{Constants.getBaseURL(WelcomeActivity.this)+"device_status.php", "device_status",
                String.valueOf(batteryPercentage), androidId};
        new InternetHelper(WelcomeActivity.this).execute(stringrray);
        startTimer();

    }

    public void uploadException(String line,String excep){
        try {
            String line_no = line;
            String exception = excep;
            String activity = WELCOMELOG;
            String[] stringrray = new String[]{Constants.getBaseURL(WelcomeActivity.this) + "insert_exception.php", "add_exception",
                    line_no,
                    activity,
                    exception};
            new InternetHelper(WelcomeActivity.this).execute(stringrray);
        }catch (Exception e){
            Log.e(WELCOMELOG,"in upload exception catch");
            e.printStackTrace();
        }

    }
}
