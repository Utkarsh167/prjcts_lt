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

import graymars.feedibk.com.myapplication.Activities.Feedback;
import graymars.feedibk.com.myapplication.Activities.Verification;
import graymars.feedibk.com.myapplication.Activities.WelcomeActivity;
import graymars.feedibk.com.myapplication.Services.InternetHelper;

import static android.bluetooth.BluetoothProfile.GATT;
import static android.content.Context.BLUETOOTH_SERVICE;
import static android.content.Context.INPUT_METHOD_SERVICE;

/**
 * Created by hemant on 10/02/2019.
 */

public class Constants {

    //172.20.10.11   13.126.106.225 192.168.43.163 192.168.89.177
    //192.168.2.41 192.168.43.67
    public static String base_url = "http://13.126.106.225/xp-backend/index.php/";
    //public static String base_url = "http://192.168.43.68/feediback-new/admin-panel/api/";
    public static String used_id = "abc1234";
    public static String welcome_message = null;
    public static String tagline = null;
    public static String master_question = null;
    public static String followup_question = null;
    public static String followup_question_positive = null;
    public static String followup_question_negative = null;
    public static String followup_question_neutral = null;

    public static String followup_question_neutral_id = null;
    public static String followup_question_negative_id = null;
    public static String followup_question_positive_id = null;
    public static String followup_question_id = null;

    public static String option_1 = null;
    public static String option_2 = null;
    public static String option_3 = null;
    public static String option_4 = null;
    public static String option_5 = null;
    public static String option_6 = null;

    public static String option_1_positive = null;
    public static String option_2_positive = null;
    public static String option_3_positive = null;
    public static String option_4_positive = null;
    public static String option_5_positive = null;
    public static String option_6_positive = null;

    public static String option_1_negative = null;
    public static String option_2_negative = null;
    public static String option_3_negative = null;
    public static String option_4_negative = null;
    public static String option_5_negative = null;
    public static String option_6_negative = null;

    public static String option_1_neutral = null;
    public static String option_2_neutral = null;
    public static String option_3_neutral = null;
    public static String option_4_neutral = null;
    public static String option_5_neutral = null;
    public static String option_6_neutral = null;
    public static String remark_title = null;

    private static String uniqueID = null;
    private static final String PREF_UNIQUE_ID = "PREF_UNIQUE_ID";
    public static Integer survey_id = 0;
    public static String emp_name = null;
    public static String emp_id = null;
    public static String survey_name = null;
    public static boolean bluetoothConnected = false;


    public static void showPasswordDialog(final Context context, final View view){
        final AlertDialog.Builder builder = new AlertDialog.Builder(context);
        LayoutInflater inflater = (LayoutInflater) context.getSystemService( Context.LAYOUT_INFLATER_SERVICE );
        builder.setTitle("Enter Password");
        View dialogLayout = inflater.inflate(R.layout.alert_dialog_password, null);
        final EditText password =  dialogLayout.findViewById(R.id.editText_Password);
        builder.setView(dialogLayout);
            builder.setPositiveButton("OK", new DialogInterface.OnClickListener() {
                @Override
                public void onClick(DialogInterface dialogInterface, int i) {

                    if(password.getText().toString().equals(""))
                    {
                        ((InputMethodManager) context.getSystemService(Context.INPUT_METHOD_SERVICE))
                                .hideSoftInputFromWindow(password.getWindowToken(), 0);
                        Toast.makeText(context, "Please enter the password to continue", Toast.LENGTH_SHORT).show();
                    }
                    else{
                        ((InputMethodManager) context.getSystemService(Context.INPUT_METHOD_SERVICE))
                                .hideSoftInputFromWindow(password.getWindowToken(), 0);
                        String[] stringrray = new String[]{Constants.base_url+"xp_android/check_tablet_password", "check_password",
                        password.getText().toString(),
                                context.getSharedPreferences("PREFERENCE", Context.MODE_PRIVATE).getString("tablet_name","")};
                        new InternetHelper(context).execute(stringrray);
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

    public static void showEmployeeInfoDialog(final Context context, final View view){
        final AlertDialog.Builder builder = new AlertDialog.Builder(context);
        LayoutInflater inflater = (LayoutInflater) context.getSystemService( Context.LAYOUT_INFLATER_SERVICE );
        builder.setTitle("Enter Employee ID");
        View dialogLayout = inflater.inflate(R.layout.alert_dialog_info, null);
        final EditText emp_info =  dialogLayout.findViewById(R.id.editText_info);
        builder.setView(dialogLayout);
        builder.setPositiveButton("OK", new DialogInterface.OnClickListener() {
            @Override
            public void onClick(DialogInterface dialogInterface, int i) {

                if(emp_info.getText().toString().equals(""))
                {
                    ((InputMethodManager) context.getSystemService(Context.INPUT_METHOD_SERVICE))
                            .hideSoftInputFromWindow(emp_info.getWindowToken(), 0);
                    Toast.makeText(context, "Please enter valid employee id to continue", Toast.LENGTH_SHORT).show();
                }
                else{
//                    Toast.makeText(context, emp_info.getText().toString().trim(), Toast.LENGTH_SHORT).show();
                    Constants.emp_id =  emp_info.getText().toString().trim();
                    Intent intent = new Intent(context, Feedback.class);
                    intent.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
                    context.startActivity(intent);
                    ((InputMethodManager) context.getSystemService(Context.INPUT_METHOD_SERVICE))
                            .hideSoftInputFromWindow(emp_info.getWindowToken(), 0);
                    dialogInterface.dismiss();
//                    ((InputMethodManager) context.getSystemService(Context.INPUT_METHOD_SERVICE))
//                            .hideSoftInputFromWindow(password.getWindowToken(), 0);
//                    String[] stringrray = new String[]{Constants.base_url+"xp_android/check_tablet_password", "check_password",
//                            password.getText().toString(),
//                            context.getSharedPreferences("PREFERENCE", Context.MODE_PRIVATE).getString("tablet_name","")};
//                    new InternetHelper(context).execute(stringrray);
                }

                // Toast.makeText(context, "Password is " + password, Toast.LENGTH_SHORT).show();
            }
        });
        builder.setNegativeButton("Cancel", new DialogInterface.OnClickListener() {
            @Override
            public void onClick(DialogInterface dialogInterface, int i) {
                ((InputMethodManager) context.getSystemService(Context.INPUT_METHOD_SERVICE))
                        .hideSoftInputFromWindow(emp_info.getWindowToken(), 0);
                dialogInterface.dismiss();
            }
        });
        builder.show();
    }


    public static void BluetoothNotConnectedDialog(final Context context, final View view){
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

        alertDialogBuilder.setNegativeButton("No",new DialogInterface.OnClickListener() {
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
        Log.i("Connected Devices: ", connected.size()+"");
        if(connected.size()==0)
        {
            return false;
        }
        else if(connected.size()>0) {
            return true;
        }
        else
        {
            return true;
        }
    }
}
