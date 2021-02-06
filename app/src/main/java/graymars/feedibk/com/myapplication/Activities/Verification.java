package graymars.feedibk.com.myapplication.Activities;

import android.app.ActivityManager;
import android.app.AlertDialog;
import android.app.ProgressDialog;
import android.bluetooth.BluetoothA2dp;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothManager;
import android.bluetooth.BluetoothProfile;
import android.bluetooth.BluetoothSocket;
import android.content.BroadcastReceiver;
import android.content.ComponentName;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.IntentFilter;
import android.graphics.Color;
import android.os.Handler;
import android.os.PowerManager;
import android.os.SystemClock;
import android.support.design.widget.CoordinatorLayout;
import android.support.design.widget.Snackbar;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.text.Editable;
import android.text.TextWatcher;
import android.util.Log;
import android.view.KeyEvent;
import android.view.LayoutInflater;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.view.inputmethod.EditorInfo;
import android.view.inputmethod.InputMethodManager;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.CheckBox;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.ListView;
import android.widget.TextView;
import android.widget.Toast;

import org.json.JSONArray;
import org.json.JSONObject;
import org.w3c.dom.Text;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import graymars.feedibk.com.myapplication.Constants;
//import graymars.feedibk.com.myapplication.Helper.CryptLib;
import graymars.feedibk.com.myapplication.R;
import graymars.feedibk.com.myapplication.Services.InternetHelper;

import static android.bluetooth.BluetoothProfile.GATT;
import static graymars.feedibk.com.myapplication.Constants.bluetoothConnected;


@SuppressWarnings("ALL")
public class Verification extends AppCompatActivity{

    ProgressDialog progressDialog;
    ImageView imageView_settings;
    EditText editText_empId;
    public static int verification_time_out=1000;
    public static Verification instance;
    AlertDialog dialog;
    Handler handler=  new Handler();
    private BluetoothSocket mBTSocket = null; // bi-directional client-to-client data path

    private Handler mHandler; // Our main handler that will receive callback notifications
    private ConnectedThread mConnectedThread; // bluetooth background worker thread to send and receive data

    private static final UUID BTMODULEUUID = UUID.fromString("00001101-0000-1000-8000-00805F9B34FB"); // "random" unique identifier

    private BluetoothAdapter mBTAdapter;
    private Set<BluetoothDevice> mPairedDevices;
    HashMap<String, String> listPairedDevices = new HashMap<>();

    // #defines for identifying shared types between calling functions
    private final static int REQUEST_ENABLE_BT = 1; // used to identify adding bluetooth names
    public final static int MESSAGE_READ = 2; // used in bluetooth handler to identify message update
    private final static int CONNECTING_STATUS = 3; // used in bluetooth handler to identify message status

    int default_timer;
    CoordinatorLayout coordinatorLayout_verification;
    Snackbar snackbar;
    //CryptLib cryptLib;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        //wake lock


        try {
            getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
            PowerManager powerManager = (PowerManager) getSystemService(POWER_SERVICE);
            PowerManager.WakeLock wakeLock = powerManager.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "MyApp::MyWakelockTag");
            wakeLock.acquire();

            requestWindowFeature(Window.FEATURE_NO_TITLE);
            getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN, WindowManager.LayoutParams.FLAG_FULLSCREEN);

            setContentView(R.layout.activity_verification);
            instance = this;

            // cryptLib = new CryptLib();

            progressDialog = new ProgressDialog(this);
            coordinatorLayout_verification = findViewById(R.id.coordinatorLayout_verification);

            imageView_settings = findViewById(R.id.imageView_settings);
            imageView_settings.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View view) {
                    Constants.showPasswordDialog(Verification.this, view);
                    ((InputMethodManager)getSystemService(Context.INPUT_METHOD_SERVICE))
                            .showSoftInput(getWindow().getDecorView(), InputMethodManager.SHOW_FORCED);
                }
            });

           //   empFound(null);

            mBTAdapter = BluetoothAdapter.getDefaultAdapter(); // get a handle on the bluetooth radio

            checkBluetoothConnection();
            listPairedDevices();
            connectToBluetoothDevice();

         //  empFound(null);
            default_timer = Integer.parseInt(getSharedPreferences("PREFERENCE", MODE_PRIVATE).getString("tablet_timer", ""));


            handler.postDelayed(new Runnable() {

                @Override
                public void run() {

                    try {
                        Constants.emp_id = null;
                        Constants.emp_name = null;
                        Constants.survey_id= null;
                        Constants.survey_name = null;
                        handler.removeMessages(0);
                        Intent i = new Intent(Verification.this, WelcomeActivity.class);
                        i.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
                        startActivity(i);
                        finish();

                    }catch (Exception e)
                    {
                        System.out.print(e);
                    }

                }
            }, default_timer*1000*60);

           mHandler = new Handler(){
                public void handleMessage(android.os.Message msg){ if(msg.what == MESSAGE_READ){

                    String readMessage = null;
                    String substr = null;

                    try {

                        readMessage = (String) msg.obj;
                        readMessage = readMessage.replaceAll("\\r\\n", "");
                    } catch (Exception e) {
                        e.printStackTrace();
                        Toast.makeText(Verification.this,
                                "Card not recognized. Please try again", Toast.LENGTH_SHORT).show();
                    }
                    System.out.print(readMessage);
                    if(readMessage.equals("0"))
                    {
                        Toast.makeText(Verification.this,
                                "Card not recognized. Please try again", Toast.LENGTH_SHORT).show();
                    }
                    else {

                        String className = checkCurrentFocuedActivity();
                        if(className.equals("Verification"))
                            showAlertDialog(readMessage);
                    }
                }

                else if(msg.what == CONNECTING_STATUS){
                    if(msg.arg1 == 1) {
                        progressDialog.dismiss();
                        if(snackbar!=null)
                        {
                            snackbar.dismiss();
                        }
                        //  Toast.makeText(Verification.this, "Connected to Device: ", Toast.LENGTH_SHORT).show();
                    }
                    else{
                        progressDialog.dismiss();
                        connectToBluetoothDevice();
                        showSnackBar("Bluetooth Connection Failed.");
                        // Toast.makeText(Verification.this, "Connection failed: ", Toast.LENGTH_SHORT).show();
                    }
                }
                }
            };

        }catch (Exception e)
        {
            // Toast.makeText(Verification.this, e.toString(), Toast.LENGTH_SHORT).show();
            System.out.print(e);
        }
    }

    private String checkCurrentFocuedActivity() {
        ActivityManager am = (ActivityManager) this.getSystemService(ACTIVITY_SERVICE);
        List<ActivityManager.RunningTaskInfo> taskInfo = am.getRunningTasks(1);
        Log.d("topActivity", "CURRENT Activity ::" + taskInfo.get(0).topActivity.getClassName());
        String a = taskInfo.get(0).topActivity.getClassName();
        String className = a.substring(a.lastIndexOf(".") + 1).trim();
        return className;
    }

    private void checkBluetoothConnection() {
        if (!mBTAdapter.isEnabled()) {
            bluetoothConnected = false;
            Intent enableBtIntent = new Intent(BluetoothAdapter.ACTION_REQUEST_ENABLE);
            startActivityForResult(enableBtIntent, REQUEST_ENABLE_BT);
            Toast.makeText(getApplicationContext(), "Bluetooth not turned on", Toast.LENGTH_SHORT).show();

        } else {
            Toast.makeText(getApplicationContext(), "Bluetooth is already on", Toast.LENGTH_SHORT).show();
        }
    }

    // Enter here after user selects "yes" or "no" to enabling radio
    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent Data){
        // Check which request we're responding to
        if (requestCode == REQUEST_ENABLE_BT) {
            // Make sure the request was successful
            if (resultCode == RESULT_OK) {
                // The user picked a contact.
                // The Intent's data Uri identifies which contact was selected.
                Toast.makeText(getApplicationContext(),"Bluetooth Enabled",Toast.LENGTH_SHORT).show();

            }
            else
                Toast.makeText(getApplicationContext(),"Bluetooth Disabled",Toast.LENGTH_SHORT).show();

        }
    }

    private void listPairedDevices(){
        mPairedDevices = mBTAdapter.getBondedDevices();
        if(mBTAdapter.isEnabled()) {
            // put it's one to the adapter
            for (BluetoothDevice device : mPairedDevices) {
                listPairedDevices.put(device.getName(), device.getAddress());
                //  mBTArrayAdapter.add(device.getName() + "\n" + device.getAddress());
            }
            Toast.makeText(getApplicationContext(), "Show Paired Devices", Toast.LENGTH_SHORT).show();
        }
        else
            Toast.makeText(getApplicationContext(), "Bluetooth not on", Toast.LENGTH_SHORT).show();
    }

    private void showAlertDialog(String emp_id){

        try {
            AlertDialog.Builder builder = new AlertDialog.Builder(this);
            LayoutInflater inflater = (LayoutInflater) this.getSystemService(Context.LAYOUT_INFLATER_SERVICE);
            //  builder.setTitle("Make Payment");
            View dialogLayout = inflater.inflate(R.layout.custom_dialog, null);
            TextView text = (TextView) dialogLayout.findViewById(R.id.textView_customProgressDialog);
            text.setText("Verifying");
            ImageView image = (ImageView) dialogLayout.findViewById(R.id.imageView_customProgressDialog);
            builder.setView(dialogLayout);
        /* builder.setPositiveButton("OK", new DialogInterface.OnClickListener() {
               @Override
                public void onClick(DialogInterface dialogInterface, int i) {
                    Toast.makeText(context, "Rating is " + ratingBar.getRating(), Toast.LENGTH_SHORT).show();
                }
        });*/
            dialog = builder.show();
            dialog.setCancelable(false);

            //   emp_id =  cryptLib.encryptPlainTextWithRandomIV(emp_id, Constants.key);
            //  String[] stringrray = new String[]{Constants.getBaseURL(Verification.this) + "fetch_emp_detailsa",
            //          "get_emp_record", emp_id};
            String[] stringrray = new String[]{Constants.base_url + "xp_android/fetch_emp_details",
                    "get_emp_record", emp_id};
            new InternetHelper(Verification.this).execute(stringrray);
        }
        catch (Exception e)
        {
            System.out.print(e);
        }

        //  Toast.makeText(Verification.this, editText_empId.getText().toString(), Toast.LENGTH_LONG).show();
    }

    public void showSnackBar(String message)
    {
        try {
            // dialog.dismiss();
            // progressDialog.dismiss();
            /*snackbar = Snackbar.make(coordinatorLayout_verification, message,
                    Snackbar.LENGTH_INDEFINITE)
                    .setAction("Retry", new View.OnClickListener() {
                        @Override
                        public void onClick(View view) {
                            connectToBluetoothDevice();
                        }
                    });

            // Changing message text color
            snackbar.setActionTextColor(Color.RED);
            // Changing action button text color
            View sbView = snackbar.getView();
            TextView textView = (TextView) sbView.findViewById(android.support.design.R.id.snackbar_text);
            textView.setTextColor(Color.YELLOW);
            //   snackbar.setIndeterminate(true);
            snackbar.show();*/

            // Toast.makeText(Verification.this,message, Toast.LENGTH_SHORT).show();
        }catch (Exception e)
        {
            System.out.print(e);
            Toast.makeText(Verification.this, e.toString(), Toast.LENGTH_SHORT).show();
        }
    }


    public void empNotFound()
    {
        dialog.dismiss();

        AlertDialog.Builder builder = new AlertDialog.Builder(this);
        LayoutInflater inflater = (LayoutInflater) this.getSystemService( Context.LAYOUT_INFLATER_SERVICE );
        //  builder.setTitle("Make Payment");
        View dialogLayout = inflater.inflate(R.layout.custom_dialog, null);
        TextView text = (TextView) dialogLayout.findViewById(R.id.textView_customProgressDialog);
        text.setText("Acces Denied");
        ImageView image = (ImageView) dialogLayout.findViewById(R.id.imageView_customProgressDialog);
        image.setImageResource(R.drawable.not_verified);
        builder.setView(dialogLayout);
        /*builder.setPositiveButton("Please try again", new DialogInterface.OnClickListener() {
               @Override
                public void onClick(DialogInterface dialogInterface, int i) {
                    dialogInterface.dismiss();
                }
        });*/
        dialog =  builder.show();
        new Handler().postDelayed(new Runnable() {

            @Override
            public void run() {

                try {
                    dialog.dismiss();
                }catch (Exception e)
                {
                    System.out.print(e);
                }

            }
        }, 2000);


    }

    public void empFound(JSONObject jsonObject) {
        //   progressDialog.dismiss();

        try {
            progressDialog.dismiss();
            if(jsonObject==null){
               // Constants.emp_name = "Demo User 2";
                //Constants.emp_id = "1399615";
               // handler.removeMessages(0);
                Intent intent = new Intent(Verification.this, Feedback.class);
                intent.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
                startActivity(intent);
                finish();
            }
            else{
                // Toast.makeText(Verification.this, "Reached Here", Toast.LENGTH_SHORT).show();
                JSONObject data = jsonObject.getJSONObject("data");



                Constants.emp_name = data.getString("emp_name");
                //   Constants.emp_name = cryptLib.decryptCipherTextWithRandomIV(Constants.emp_name,
                //         Constants.key);

                Constants.emp_id = data.getString("emp_id");

                AlertDialog.Builder builder = new AlertDialog.Builder(this);
                LayoutInflater inflater = (LayoutInflater) this.getSystemService(Context.LAYOUT_INFLATER_SERVICE);
                View dialogLayout = inflater.inflate(R.layout.custom_dialog, null);
                TextView text = (TextView) dialogLayout.findViewById(R.id.textView_customProgressDialog);
                text.setText("Success");
                ImageView image = (ImageView) dialogLayout.findViewById(R.id.imageView_customProgressDialog);
                image.setImageResource(R.drawable.verified);
                builder.setView(dialogLayout);
                dialog = builder.show();

               // handler.removeMessages(0);
                new Handler().postDelayed(new Runnable() {

                    @Override
                    public void run() {

                        try {
                            dialog.dismiss();
                            Intent intent = new Intent(Verification.this, Feedback.class);
                            intent.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
                          //  handler.removeMessages(0);
                            startActivity(intent);
                            finish();
                        }catch (Exception e)
                        {
                            System.out.print(e);
                        }

                    }
                }, 1000);
//                if (data.length() > 0) {
//                    for (int i = 0; i < data.length(); i++) {
//                        JSONObject user_detail = data.getJSONObject(i);
//
//                        Constants.emp_name = user_detail.getString("emp_name");
//                        //   Constants.emp_name = cryptLib.decryptCipherTextWithRandomIV(Constants.emp_name,
//                        //         Constants.key);
//
//                        Constants.emp_id = user_detail.getString("emp_id");
//                    }
//
//
//
//              /*  new Handler().postDelayed(new Runnable() {
//
//                    @Override
//                    public void run() {
//
//                        try {
//                            dialog.dismiss();
//
//                            String[] stringrray = new String[]{Constants.base_url+"getSurveyType.php",
//                                    "get_survey_type", String.valueOf(Constants.survey_id)};
//                            new InternetHelper(Verification.this).execute(stringrray);
//
//                        }catch (Exception e)
//                        {
//                            System.out.print(e);
//                        }
//
//                    }
//                }, 1000);*/
//                }


            }
            // Toast.makeText(this, "Tablet Exist.", Toast.LENGTH_SHORT).show();
        }catch (Exception e)
        {
            System.out.print(e);
            //  Toast.makeText(Verification.this, e.toString(), Toast.LENGTH_SHORT).show();
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
    public void onBackPressed(){
        handler.removeMessages(0);

        Intent i = new Intent(Verification.this, WelcomeActivity.class);
        i.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
        startActivity(i);
    }

    private void connectToBluetoothDevice(){
        //progressDialog.setCancelable(false);
        try {
            progressDialog.setMessage("Please wait. Finding Access Control...");
            progressDialog.show();
            if (!mBTAdapter.isEnabled()) {
                Toast.makeText(getBaseContext(), "Bluetooth not on", Toast.LENGTH_SHORT).show();
                return;
            }

            Toast.makeText(this, "Connecting...", Toast.LENGTH_SHORT).show();


            String address = null, name = null;
            String ble_device_name = getSharedPreferences("PREFERENCE", MODE_PRIVATE)
                    .getString("bl_device_name", "");
            for (Map.Entry<String, String> entry : listPairedDevices.entrySet()) {

                name = entry.getKey();
                /*if (name.equals(ble_device_name) || name.equals(ble_device_name + " ")) {
                    address = entry.getValue();
                }*/
                name.replaceAll(System.getProperty("line.separator"), "");

                name = name.replaceAll("\n","");

                if(name.equals("HC-05") || name.equals("HC-05 ")) {
                    address = entry.getValue();
                }
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
                        }
                        // Establish the Bluetooth socket connection.
                        try {
                            mBTSocket.connect();
                        } catch (IOException e) {
                            try {
                                fail = true;
                                mBTSocket.close();
                                mHandler.obtainMessage(CONNECTING_STATUS, -1, -1)
                                        .sendToTarget();
                            } catch (IOException e2) {
                                //insert code to deal with this
                                Toast.makeText(getBaseContext(), "Socket creation failed", Toast.LENGTH_SHORT).show();
                            }
                        }
                        if (fail == false) {
                            mConnectedThread = new ConnectedThread(mBTSocket);
                            mConnectedThread.start();

                            mHandler.obtainMessage(CONNECTING_STATUS, 1, -1, finalName)
                                    .sendToTarget();
                        }
                    }
                }.start();
            }
        }catch (Exception e)
        {
            System.out.print(e);
        }
    }

    private BluetoothSocket createBluetoothSocket(BluetoothDevice device) throws IOException {
        return  device.createRfcommSocketToServiceRecord(BTMODULEUUID);
        //creates secure outgoing connection with BT device using UUID
    }

    class ConnectedThread extends Thread {
        private final BluetoothSocket mmSocket;
        private final InputStream mmInStream;
        private final OutputStream mmOutStream;

        public ConnectedThread(BluetoothSocket socket) {
            mmSocket = socket;
            InputStream tmpIn = null;
            OutputStream tmpOut = null;

            // Get the input and output streams, using temp objects because
            // member streams are final
            try {
                tmpIn = socket.getInputStream();
                tmpOut = socket.getOutputStream();
            } catch (IOException e) { }

            mmInStream = tmpIn;
            mmOutStream = tmpOut;
        }

        public void run() {
            byte[] buffer = new byte[1024];  // buffer store for the stream
            int bytes; // bytes returned from read()
            String readMessage;

            // Keep listening to the InputStream until an exception occurs
            while (true) {
                try {
                    // Read from the InputStream
                    //  bytes = mmInStream.read(buffer);
                   /* if(bytes != 0) {
                        SystemClock.sleep(100);
                        mmInStream.read(buffer);
                        readMessage = new String(buffer, 0, bytes);
                        System.out.print(readMessage);
                    }*/
                    // Send the obtained bytes to the UI activity
                    if (mmInStream.available()>2) {
                        try {
                            // Read from the InputStream
                            bytes = mmInStream.read(buffer);
                            readMessage = new String(buffer, 0, bytes);

                        }catch (IOException e) {
                            System.out.print("disconnected");
                            break;
                        }
                        // Send the obtained bytes to the UI Activity
                        mHandler.obtainMessage(MESSAGE_READ, bytes, -1, readMessage)
                                .sendToTarget();
                    }
                    else {
                        SystemClock.sleep(100);
                    }

                    //   mHandler.obtainMessage(MESSAGE_READ, bytes, -1, buffer)
                    //    .sendToTarget();
                } catch (IOException e) {
                    break;
                }
            }
        }

        /* Call this from the main activity to send data to the remote device */
        public void write(String input) {
            byte[] bytes = input.getBytes();           //converts entered String into bytes
            try {
                mmOutStream.write(bytes);
            } catch (IOException e) {
                System.out.print(e);
            }
        }

        /* Call this from the main activity to shutdown the connection */
        public void cancel() {
            try {
                mmSocket.close();
            } catch (IOException e) {
                System.out.print(e);
            }
        }
    }


    @Override
    protected void onUserLeaveHint()
    {
        handler.removeMessages(0);
    }
}