
package graymars.feedibk.com.myapplication.Activities;

import android.app.ActivityManager;
import android.app.AlertDialog;
import android.app.ProgressDialog;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothSocket;
import android.content.Context;
import android.content.Intent;
import android.os.AsyncTask;
import android.os.Bundle;
import android.os.Handler;
import android.os.PowerManager;
import android.os.SystemClock;
import android.provider.Settings;
import android.support.design.widget.CoordinatorLayout;
import android.support.design.widget.Snackbar;
import android.support.v7.app.AppCompatActivity;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.view.inputmethod.InputMethodManager;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.TextView;
import android.widget.Toast;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import graymars.feedibk.com.myapplication.Constants;
import graymars.feedibk.com.myapplication.Helper.CryptLib;
import graymars.feedibk.com.myapplication.R;
import graymars.feedibk.com.myapplication.Services.InternetHelper;

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
    int default_timer;
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

    CoordinatorLayout coordinatorLayout_verification;
    Snackbar snackbar;
    CryptLib cryptLib;
    public  final String VERIFICATIONTAG="VERIFICATIONACT";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        Log.e(VERIFICATIONTAG,"in on create");

        try {
            Log.e(VERIFICATIONTAG,"in on create try");
            requestWindowFeature(Window.FEATURE_NO_TITLE);
            getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN, WindowManager.LayoutParams.FLAG_FULLSCREEN);

            setContentView(R.layout.activity_verification);

//            getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);

//            PowerManager powerManager = (PowerManager) getSystemService(POWER_SERVICE);
//            PowerManager.WakeLock wakeLock = powerManager.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK,
//                    "MyApp::MyWakelockTag");
//            wakeLock.acquire();

            instance = this;
            default_timer = Integer.parseInt(getSharedPreferences("PREFERENCE", MODE_PRIVATE).getString("tablet_timer", ""));

            cryptLib = new CryptLib();

            progressDialog = new ProgressDialog(this);
            coordinatorLayout_verification = findViewById(R.id.coordinatorLayout_verification);

//            TurnBluetoothOnAndConnectDevice turnBluetoothOnAndConnectDevice=new TurnBluetoothOnAndConnectDevice();
//            turnBluetoothOnAndConnectDevice.
            mBTAdapter = BluetoothAdapter.getDefaultAdapter(); // get a handle on the bluetooth radio

           // empFound(null);
            checkBluetoothConnection();
            listPairedDevices();
            if(Constants.checkConnectedBluetoothDevices(this)){
            Log.e(VERIFICATIONTAG,"in check connected bluetooth device");
            }
            else{
                Verification.instance.showSnackBar("Bluetooth Connection Failed.");
            }
            connectToBluetoothDevice();
            handler.removeMessages(0);

            handler.postDelayed(new Runnable() {

                @Override
                public void run() {

                    try {
                        Log.e(VERIFICATIONTAG,"in on create handler");
                        Constants.emp_id = null;
                        Constants.emp_name = null;
                        Constants.survey_id= null;
                        Constants.survey_question = null;
                        handler.removeMessages(0);
                        Intent i = new Intent(Verification.this, WelcomeActivity.class);
                        i.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
                        startActivity(i);
                        finish();

                    }catch (Exception e)
                    {
                        e.printStackTrace();
                        uploadException(String.valueOf(Thread.currentThread().getStackTrace()[2].getLineNumber()),e.getMessage());
                    }

                }
            }, default_timer*1000*60);

            mHandler = new Handler(){
                public void handleMessage(android.os.Message msg){
                    if(msg.what == MESSAGE_READ){

                        String readMessage = null;
                        String substr = null;

                        try {

                            readMessage = (String) msg.obj;
                            readMessage = readMessage.replaceAll("\\r\\n", "");
                        } catch (Exception e) {
                            e.printStackTrace();
                            Toast.makeText(Verification.this,
                                    "Card not recognized. Please try again", Toast.LENGTH_SHORT).show();
                            uploadException(String.valueOf(Thread.currentThread().getStackTrace()[2].getLineNumber()),e.getMessage());

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

            imageView_settings = findViewById(R.id.imageView_settings);
            imageView_settings.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View view) {
                    Constants.showPasswordDialog(Verification.this, view);
                    ((InputMethodManager)getSystemService(Context.INPUT_METHOD_SERVICE))
                            .showSoftInput(getWindow().getDecorView(), InputMethodManager.SHOW_FORCED);
                }
            });

        }catch (Exception e)
        {

           // Toast.makeText(Verification.this, e.toString(), Toast.LENGTH_SHORT).show();
            e.printStackTrace();
            uploadException(String.valueOf(Thread.currentThread().getStackTrace()[2].getLineNumber()),e.getMessage());
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
            Log.e(VERIFICATIONTAG,"in on checkBluetoothConnection if");
            bluetoothConnected = false;
            Intent enableBtIntent = new Intent(BluetoothAdapter.ACTION_REQUEST_ENABLE);
            startActivityForResult(enableBtIntent, REQUEST_ENABLE_BT);
            Toast.makeText(getApplicationContext(), "Bluetooth not turned on", Toast.LENGTH_SHORT).show();

        } else {
            Log.e(VERIFICATIONTAG,"in on checkBluetoothConnection else Bluetooth is already on");
            //Toast.makeText(getBaseContext(), "Reason can not be blank", Toast.LENGTH_SHORT).show();
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
        Log.e(VERIFICATIONTAG,"in on listPairedDevices");
        if(mBTAdapter.isEnabled()) {
            // put it's one to the adapter
            Log.e(VERIFICATIONTAG,"in on listPairedDevices if");
            for (BluetoothDevice device : mPairedDevices) {
                listPairedDevices.put(device.getName(), device.getAddress());
                Log.e(VERIFICATIONTAG,"in on listPairedDevices if for");
                //  mBTArrayAdapter.add(device.getName() + "\n" + device.getAddress());
            }
            Toast.makeText(getApplicationContext(), "Show Paired Devices", Toast.LENGTH_SHORT).show();
        }
        else
            Log.e(VERIFICATIONTAG,"in on listPairedDevices else");
        Toast.makeText(getApplicationContext(), "Bluetooth not on", Toast.LENGTH_SHORT).show();
    }

    private void showAlertDialog(String emp_id){

        try {
            AlertDialog.Builder builder = new AlertDialog.Builder(this);
            LayoutInflater inflater = (LayoutInflater) this.getSystemService(Context.LAYOUT_INFLATER_SERVICE);
            //  builder.setTitle("Make Payment");
            View dialogLayout = inflater.inflate(R.layout.custom_dialog, null);
            TextView text = (TextView) dialogLayout.findViewById(R.id.textView_customProgressDialog);
            Log.e(VERIFICATIONTAG,"in on showAlertDialog try");
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


           emp_id =  cryptLib.encryptPlainTextWithRandomIV(emp_id, Constants.key);
            String[] stringrray = new String[]{Constants.getBaseURL(Verification.this) + "fetch_emp_details.php",
                    "get_emp_record", emp_id};
            new InternetHelper(Verification.this).execute(stringrray);
        }
        catch (Exception e)
        {
            e.printStackTrace();
            uploadException(String.valueOf(Thread.currentThread().getStackTrace()[2].getLineNumber()),e.getMessage());
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
            e.printStackTrace();
            Toast.makeText(Verification.this, e.toString(), Toast.LENGTH_SHORT).show();
            uploadException(String.valueOf(Thread.currentThread().getStackTrace()[2].getLineNumber()),e.getMessage());
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
                    e.printStackTrace();
                    uploadException(String.valueOf(Thread.currentThread().getStackTrace()[2].getLineNumber()),e.getMessage());
                }

            }
        }, 2000);


    }

    public void empFound(JSONObject jsonObject) {
     //   progressDialog.dismiss();
        dialog.dismiss();
        try {

           // Toast.makeText(Verification.this, "Reached Here", Toast.LENGTH_SHORT).show();
            JSONArray data = jsonObject.getJSONArray("data");

            if (data.length() > 0) {
                for (int i = 0; i < data.length(); i++) {
                    JSONObject user_detail = data.getJSONObject(i);

                    Constants.emp_name = user_detail.getString("emp_name");
                    Constants.emp_name = cryptLib.decryptCipherTextWithRandomIV(Constants.emp_name,
                            Constants.key);

                    Constants.emp_id = user_detail.getString("emp_id");
                }

                AlertDialog.Builder builder = new AlertDialog.Builder(this);
                LayoutInflater inflater = (LayoutInflater) this.getSystemService( Context.LAYOUT_INFLATER_SERVICE );
                View dialogLayout = inflater.inflate(R.layout.custom_dialog, null);
                TextView text = (TextView) dialogLayout.findViewById(R.id.textView_customProgressDialog);
                text.setText("Success");
                ImageView image = (ImageView) dialogLayout.findViewById(R.id.imageView_customProgressDialog);
                image.setImageResource(R.drawable.verified);
                builder.setView(dialogLayout);
                dialog =  builder.show();

                new Handler().postDelayed(new Runnable() {

                    @Override
                    public void run() {

                        try {
                            dialog.dismiss();

                            String[] stringrray = new String[]{Constants.getBaseURL(Verification.this)+"getSurveyType.php",
                                    "get_survey_type", String.valueOf(Constants.campaign_id)};
                            new InternetHelper(Verification.this).execute(stringrray);

                        }catch (Exception e)
                        {
                            e.printStackTrace();
                            uploadException(String.valueOf(Thread.currentThread().getStackTrace()[2].getLineNumber()),e.getMessage());
                        }

                    }
                }, 1000);


            }
           // Toast.makeText(this, "Tablet Exist.", Toast.LENGTH_SHORT).show();
        }catch (Exception e)
        {
            e.printStackTrace();
            uploadException(String.valueOf(Thread.currentThread().getStackTrace()[2].getLineNumber()),e.getMessage());
            //  Toast.makeText(Verification.this, e.toString(), Toast.LENGTH_SHORT).show();
        }
    }

    public void surveyDetailsFound(JSONObject jsonObject) {

        try {
            JSONArray data = jsonObject.getJSONArray("data");

            if (data.length() > 0) {
                for (int i = 0; i < data.length(); i++) {
                    JSONObject survey_detail = data.getJSONObject(i);
                    String survey_type= survey_detail.getString("survey_type");
                    String survey_question= survey_detail.getString("survey_question");
                    String survey_id= survey_detail.getString("survey_id");
                    Constants.survey_question = survey_question;
                    Constants.survey_id = survey_id;

                    if(survey_type.equals("dropdown"))
                    {
                         handler.removeMessages(0);
                         Intent intent = new Intent(Verification.this, Survey.class);
                         intent.putExtra("survey_question",survey_question);
                         startActivity(intent);
                    }
                    else if(survey_type.equals("options"))
                    {
                      //  Toast.makeText(Verification.this, "Reached in options", Toast.LENGTH_SHORT).show();
                        handler.removeMessages(0);
                        Intent intent = new Intent(Verification.this, Survey_MultiOption.class);
                        intent.putExtra("survey_question",survey_question);
                        intent.putExtra("survey_id",survey_id);
                        startActivity(intent);
                    }
                }
            }
        }catch (Exception e)
        {
            e.printStackTrace();
            uploadException(String.valueOf(Thread.currentThread().getStackTrace()[2].getLineNumber()),e.getMessage());
            // Toast.makeText(Verification.this, e.toString(), Toast.LENGTH_SHORT).show();
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
        try {
            mConnectedThread.cancel();
        }catch (Exception e){
            e.printStackTrace();
        }
        Intent i = new Intent(Verification.this, WelcomeActivity.class);
        i.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
        startActivity(i);
    }

    private void connectToBluetoothDevice(){
        //progressDialog.setCancelable(false
        Log.e("VERIFICATIONACT","in verificatoin activity");
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
                if (name.equals(ble_device_name) || name.equals(ble_device_name + " ")) {
                    address = entry.getValue();
                }
             /*
             if(name.equals("HC-05") || name.equals("HC-05 ")) {
                 address = entry.getValue();
             }*/
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
                                mHandler.obtainMessage(CONNECTING_STATUS, -1, -1)
                                        .sendToTarget();
                            } catch (IOException e2) {
                                //insert code to deal with this
                                Toast.makeText(getBaseContext(), "Socket creation failed", Toast.LENGTH_SHORT).show();
                                uploadException(String.valueOf(Thread.currentThread().getStackTrace()[2].getLineNumber()),e.getMessage());
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
            e.printStackTrace();
            uploadException(String.valueOf(Thread.currentThread().getStackTrace()[2].getLineNumber()),e.getMessage());
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
            } catch (IOException e) {
                uploadException(String.valueOf(Thread.currentThread().getStackTrace()[2].getLineNumber()),e.getMessage());

            }

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
//                    runOnUiThread(new Runnable() {
//                        public void run() {
//                            Toast.makeText(Verification.this, "in run of connected thread try", Toast.LENGTH_SHORT).show();
//                        }
//                    });
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
//                            runOnUiThread(new Runnable() {
//                                public void run() {
//                                    Toast.makeText(Verification.this, "in run of connected thread try if", Toast.LENGTH_SHORT).show();
//                                }
//                            });
                            // Read from the InputStream
                            bytes = mmInStream.read(buffer);
                            readMessage = new String(buffer, 0, bytes);

                        }catch (IOException e) {
                            System.out.print("disconnected");
                            uploadException(String.valueOf(Thread.currentThread().getStackTrace()[2].getLineNumber()),e.getMessage());
                            break;
                        }
                        // Send the obtained bytes to the UI Activity
                        mHandler.obtainMessage(MESSAGE_READ, bytes, -1, readMessage)
                                .sendToTarget();
                    }
                    else {
//                        runOnUiThread(new Runnable() {
//                            public void run() {
//                                Toast.makeText(Verification.this, "in run of connected thread try else", Toast.LENGTH_SHORT).show();
//                            }
//                        });

                        SystemClock.sleep(100);
                    }

                //   mHandler.obtainMessage(MESSAGE_READ, bytes, -1, buffer)
                        //    .sendToTarget();
                } catch (IOException e) {
                    uploadException(String.valueOf(Thread.currentThread().getStackTrace()[2].getLineNumber()),e.getMessage());
                    break;
                }
            }
        }

        /* Call this from the main activity to send data to the remote device */
        public void write(String input) {
            byte[] bytes = input.getBytes();           //converts entered String into bytes
            try {
                mmOutStream.write(bytes);
//                runOnUiThread(new Runnable() {
//                    public void run() {
//                        Toast.makeText(Verification.this, "in write", Toast.LENGTH_SHORT).show();
//
//                        //   Toast.makeText(Verification.this, "in run of connected thread try else", Toast.LENGTH_SHORT).show();
//                    }
//                });
            } catch (IOException e) {
                uploadException(String.valueOf(Thread.currentThread().getStackTrace()[2].getLineNumber()),e.getMessage());
            }
        }

        /* Call this from the main activity to shutdown the connection */
        public void cancel() {
            try {
                mmSocket.close();
            } catch (IOException e) {
                uploadException(String.valueOf(Thread.currentThread().getStackTrace()[2].getLineNumber()),e.getMessage());
            }
        }
    }

    private void addTabletEntryInDB(String exception) {
        progressDialog.setMessage("Please wait...");
        progressDialog.show();

        String androidId = android.provider.Settings.Secure.getString(getContentResolver(),
                Settings.Secure.ANDROID_ID);

        try {

            String[] stringrray = new String[]{Constants.getBaseURL(Verification.this) + "tablet.php", "add_tablet",
                    exception,
                    VERIFICATIONTAG,
                    androidId};
            new InternetHelper(Verification.this).execute(stringrray);
        }catch (Exception e)
        {
            e.printStackTrace();
            uploadException(String.valueOf(Thread.currentThread().getStackTrace()[2].getLineNumber()),e.getMessage());
        }
    }



    public void uploadException(String line,String excep){
        try {
            String line_no = line;
            String exception = excep;
            String activity = VERIFICATIONTAG;
            String[] stringrray = new String[]{Constants.getBaseURL(Verification.this) + "insert_exception.php", "add_exception",
                    line_no,
                    activity,
                    exception};
            new InternetHelper(Verification.this).execute(stringrray);
        }catch (Exception e){
            Log.e(VERIFICATIONTAG,"in upload exception catch");
            e.printStackTrace();
        }
    }

    @Override
    protected void onUserLeaveHint()
    {
        try {
            mConnectedThread.cancel();
            handler.removeMessages(0);
            finish();
        }catch (Exception e){
            e.printStackTrace();
        }
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        //dismiss dialog on destroy
        if (dialog != null){
            dialog.dismiss();
            dialog=null;
        }
    }
}


