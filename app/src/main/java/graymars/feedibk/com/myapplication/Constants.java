package graymars.feedibk.com.myapplication;

import android.app.Activity;
import android.app.AlertDialog;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothManager;
import android.bluetooth.BluetoothSocket;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.os.Build;
import android.telephony.TelephonyManager;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.inputmethod.InputMethodManager;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.TextView;
import android.widget.Toast;

import java.util.HashMap;
import java.util.List;
import java.util.UUID;

import graymars.feedibk.com.myapplication.Activities.Settings;
import graymars.feedibk.com.myapplication.Activities.TabletSettings;
import graymars.feedibk.com.myapplication.Activities.Verification;
import graymars.feedibk.com.myapplication.Activities.WelcomeActivity;
import graymars.feedibk.com.myapplication.Services.InternetHelper;

import static android.bluetooth.BluetoothProfile.GATT;
import static android.content.Context.BLUETOOTH_SERVICE;
import static android.content.Context.INPUT_METHOD_SERVICE;
import static android.content.Context.TELEPHONY_SERVICE;

/**
 * Created by hemant on 10/02/2019.
 */

public class Constants {

    //172.20.10.11   13.126.106.225 192.168.43.163 192.168.89.177
    // HPE cloud ip = 16.200.40.71, http://192.168.43.67
    //public static String base_url = "https://115.113.157.173/feediback/admin-panel/api/";
    public static String used_id = "abc1234";
    public static String IMEI = null;
    private static String uniqueID = null;
    private static final String PREF_UNIQUE_ID = "PREF_UNIQUE_ID";
    public static Integer campaign_id = 0;
    public static String emp_name = null;
    public static String emp_id = null;
    public static String survey_id = null;
    public static String survey_question = null;
    public static boolean bluetoothConnected = false;
    public static String key = "graymars_2019";
    public static boolean skip_thankYouPage = false;
    public static final String admin_password = "admin";


    public static String getBaseURL(Context context) {
        //String url = "http://192.168.43.67/feediback/admin-panel/api/";
        String url = context.getSharedPreferences("PREFERENCE", Context.MODE_PRIVATE)
                .getString("ip_address", "");
//        url = url+"/feediback/admin-panel/api/";
        url = url + "/hpe-backend/admin-panel/api/";

        return url;
    }

    public static void showPasswordDialog(final Context context, final View view) {
        final AlertDialog.Builder builder = new AlertDialog.Builder(context);
        LayoutInflater inflater = (LayoutInflater) context.getSystemService(Context.LAYOUT_INFLATER_SERVICE);
        builder.setTitle("Enter Password");
        View dialogLayout = inflater.inflate(R.layout.alert_dialog_password, null);
        final EditText password = dialogLayout.findViewById(R.id.editText_Password);
        builder.setView(dialogLayout);
        builder.setPositiveButton("OK", new DialogInterface.OnClickListener() {
            @Override
            public void onClick(DialogInterface dialogInterface, int i) {

                if (password.getText().toString().equals("")) {
                    ((InputMethodManager) context.getSystemService(Context.INPUT_METHOD_SERVICE))
                            .hideSoftInputFromWindow(password.getWindowToken(), 0);
                    Toast.makeText(context, "Please enter the password to continue", Toast.LENGTH_SHORT).show();
                } else {
                    //use this to verify admin from server
                  /*     ((InputMethodManager) context.getSystemService(Context.INPUT_METHOD_SERVICE))
                               .hideSoftInputFromWindow(password.getWindowToken(), 0);
                        String[] stringrray = new String[]{Constants.getBaseURL(context)+"check_tablet_password.php", "check_password",
                       password.getText().toString(),
                               context.getSharedPreferences("PREFERENCE", Context.MODE_PRIVATE).getString("tablet_name","")};
                       new InternetHelper(context).execute(stringrray);  */

                    //use this to verify admin locally
                    // Store password in local variable and get it here to verify (Shiva,27/2/2020:1:00pm)
                    if (admin_password.equals(password.getText().toString())) {
                        Intent intent = new Intent(context, Settings.class);
                        context.startActivity(intent);
                        Log.i("IF_CALLED", admin_password);
                    } else {
                        Toast.makeText(context, "Invalid Credintials", Toast.LENGTH_SHORT).show();
                        Log.i("ELSE_CALLED", admin_password);

                    }


                }

                // Toast.makeText(context, "Password is " + password, Toast.LENGTH_SHORT).show();
            }
        });
        builder.setNegativeButton("Cancel", new DialogInterface.OnClickListener() {
            @Override
            public void onClick(DialogInterface dialogInterface, int i) {
                ((InputMethodManager) context.getSystemService(Context.INPUT_METHOD_SERVICE))
                        .hideSoftInputFromWindow(password.getWindowToken(), 0);
                dialogInterface.dismiss();
            }
        });
        builder.show();
    }

    public static void checkIfPermissionGranted(Context context){
        String requiredPermission = "android.permission.READ_PHONE_STATE";
        int checkVal = context.checkCallingOrSelfPermission(requiredPermission);
        TelephonyManager telephonyManager = (TelephonyManager) context.getSystemService(TELEPHONY_SERVICE);
        if (checkVal== PackageManager.PERMISSION_GRANTED){

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                Constants.IMEI = telephonyManager.getImei();
                Log.d("IMEI-LOGIN", telephonyManager.getImei());
            }
            else {
                Constants.IMEI = telephonyManager.getDeviceId();
                Log.d("IMEI-LOGIN", telephonyManager.getDeviceId());
            }
        }
    }
    public static void showChangeBluetoothNameDialog(final Context context, final View view) {
        final AlertDialog.Builder builder = new AlertDialog.Builder(context);
        LayoutInflater inflater = (LayoutInflater) context.getSystemService(Context.LAYOUT_INFLATER_SERVICE);
        builder.setTitle("Enter Name of The Bluetooth Device");
        View dialogLayout = inflater.inflate(R.layout.alert_dialog_ble_device_name, null);
        final EditText bl_device_name = dialogLayout.findViewById(R.id.editText_bl_name);
        TextView textView_bluetoothDeviceName = dialogLayout.findViewById(R.id.textView_bluetoothDeviceName);

        String bluetoothDeviceName = context.getSharedPreferences("PREFERENCE", Context.MODE_PRIVATE)
                .getString("bl_device_name", "");

        if (bluetoothDeviceName.equals("")) {

        } else {
            textView_bluetoothDeviceName.setText("Current Name: " + bluetoothDeviceName);
        }

        builder.setView(dialogLayout);

        builder.setPositiveButton("OK", new DialogInterface.OnClickListener() {
            @Override
            public void onClick(DialogInterface dialogInterface, int i) {

                if (bl_device_name.getText().toString().equals("")) {
                    ((InputMethodManager) context.getSystemService(Context.INPUT_METHOD_SERVICE))
                            .hideSoftInputFromWindow(bl_device_name.getWindowToken(), 0);
                    Toast.makeText(context, "Please enter the device name to continue", Toast.LENGTH_SHORT).show();
                } else {
                    ((InputMethodManager) context.getSystemService(Context.INPUT_METHOD_SERVICE))
                            .hideSoftInputFromWindow(bl_device_name.getWindowToken(), 0);
                    context.getSharedPreferences("PREFERENCE", Context.MODE_PRIVATE).edit()
                            .putString("bl_device_name", bl_device_name.getText().toString().trim())
                            .commit();

                    Toast.makeText(context, "Name Changed Successfully", Toast.LENGTH_SHORT).show();
                }

                // Toast.makeText(context, "Password is " + password, Toast.LENGTH_SHORT).show();
            }
        });
        builder.setNegativeButton("Cancel", new DialogInterface.OnClickListener() {
            @Override
            public void onClick(DialogInterface dialogInterface, int i) {
                ((InputMethodManager) context.getSystemService(Context.INPUT_METHOD_SERVICE))
                        .hideSoftInputFromWindow(bl_device_name.getWindowToken(), 0);
                dialogInterface.dismiss();
            }
        });
        builder.show();
    }

    public static void showChangeIPDialog(final Context context, final View view) {
        final AlertDialog.Builder builder = new AlertDialog.Builder(context);
        LayoutInflater inflater = (LayoutInflater) context.getSystemService(Context.LAYOUT_INFLATER_SERVICE);
        builder.setTitle("Enter the IP Address of the server");
        View dialogLayout = inflater.inflate(R.layout.alert_dialog_ble_device_name, null);
        final EditText ip_address = dialogLayout.findViewById(R.id.editText_bl_name);
        builder.setView(dialogLayout);
        builder.setPositiveButton("OK", new DialogInterface.OnClickListener() {
            @Override
            public void onClick(DialogInterface dialogInterface, int i) {

                if (ip_address.getText().toString().equals("")) {
                    ((InputMethodManager) context.getSystemService(Context.INPUT_METHOD_SERVICE))
                            .hideSoftInputFromWindow(ip_address.getWindowToken(), 0);
                    Toast.makeText(context, "Please enter the ip to continue", Toast.LENGTH_SHORT).show();
                } else {
                    ((InputMethodManager) context.getSystemService(Context.INPUT_METHOD_SERVICE))
                            .hideSoftInputFromWindow(ip_address.getWindowToken(), 0);
                    context.getSharedPreferences("PREFERENCE", Context.MODE_PRIVATE).edit()
                            .putString("ip_address", ip_address.getText().toString())
                            .commit();
                    Toast.makeText(context, "IP Address Changed Successfully", Toast.LENGTH_SHORT).show();
                }

                // Toast.makeText(context, "Password is " + password, Toast.LENGTH_SHORT).show();
            }
        });
        builder.setNegativeButton("Cancel", new DialogInterface.OnClickListener() {
            @Override
            public void onClick(DialogInterface dialogInterface, int i) {
                ((InputMethodManager) context.getSystemService(Context.INPUT_METHOD_SERVICE))
                        .hideSoftInputFromWindow(ip_address.getWindowToken(), 0);
                dialogInterface.dismiss();
            }
        });
        builder.show();
    }

    public static void BluetoothNotConnectedDialog(final Context context, final View view) {
        final AlertDialog.Builder alertDialogBuilder = new AlertDialog.Builder(context);
        alertDialogBuilder.setTitle("Bluetooth Not Connected.");
        alertDialogBuilder.setMessage("Please inform the administrator and come back. Thank You");
        alertDialogBuilder.setPositiveButton("yes",
                new DialogInterface.OnClickListener() {
                    @Override
                    public void onClick(DialogInterface arg0, int arg1) {
                        arg0.dismiss();
                        // Toast.makeText(context,"You clicked yes button",Toast.LENGTH_LONG).show();
                    }
                });

        alertDialogBuilder.setNegativeButton("No", new DialogInterface.OnClickListener() {
            public void onClick(DialogInterface dialog, int which) {
                dialog.dismiss();
            }
        });

        AlertDialog alertDialog = alertDialogBuilder.create();
        alertDialog.show();
    }

    public synchronized static String id(Context context) {
        if (uniqueID == null) {
            SharedPreferences sharedPrefs = context.getSharedPreferences(
                    PREF_UNIQUE_ID, Context.MODE_PRIVATE);
            uniqueID = sharedPrefs.getString(PREF_UNIQUE_ID, null);
            if (uniqueID == null) {
                uniqueID = UUID.randomUUID().toString();
                SharedPreferences.Editor editor = sharedPrefs.edit();
                editor.putString(PREF_UNIQUE_ID, uniqueID);
                editor.commit();
            }
        }
        return uniqueID;
    }

    public static boolean checkConnectedBluetoothDevices(Context context) {

        BluetoothManager manager = (BluetoothManager) context.getSystemService(BLUETOOTH_SERVICE);
        List<BluetoothDevice> connected = manager.getConnectedDevices(GATT);
        Log.i("Connected Devices: ", connected.size() + "");
        if (connected.size() == 0) {
            return false;
        } else if (connected.size() > 0) {
            return true;
        } else {
            return true;
        }
    }
}
