package graymars.feedibk.com.myapplication.Services;

import android.content.Context;
import android.content.Intent;
import android.os.AsyncTask;
import android.util.Log;
import android.widget.Toast;

import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpPost;
import org.json.JSONObject;

import java.io.BufferedInputStream;
import java.io.BufferedReader;
import java.io.EOFException;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.net.HttpURLConnection;
import java.net.SocketTimeoutException;
import java.net.URL;
import java.net.URLConnection;
import java.security.KeyStore;
import java.security.cert.Certificate;
import java.security.cert.CertificateException;
import java.security.cert.CertificateFactory;
import java.security.cert.X509Certificate;
import java.text.SimpleDateFormat;
import java.util.Arrays;
import java.util.Date;
import java.util.LinkedHashMap;

import javax.net.ssl.HostnameVerifier;
import javax.net.ssl.HttpsURLConnection;
import javax.net.ssl.SSLContext;
import javax.net.ssl.SSLSession;
import javax.net.ssl.TrustManager;
import javax.net.ssl.TrustManagerFactory;
import javax.net.ssl.X509TrustManager;

import graymars.feedibk.com.myapplication.Activities.Feedback;
import graymars.feedibk.com.myapplication.Activities.LoginActivity;
import graymars.feedibk.com.myapplication.Activities.MainActivity;
import graymars.feedibk.com.myapplication.Activities.Settings;
import graymars.feedibk.com.myapplication.Activities.Survey;
import graymars.feedibk.com.myapplication.Activities.Survey_MultiOption;
import graymars.feedibk.com.myapplication.Activities.TabletSettings;
import graymars.feedibk.com.myapplication.Activities.Verification;
import graymars.feedibk.com.myapplication.Activities.WelcomeActivity;
import graymars.feedibk.com.myapplication.Constants;
import graymars.feedibk.com.myapplication.R;

import static android.content.Context.MODE_PRIVATE;
import static graymars.feedibk.com.myapplication.Helper.CustomCAHttpsProvider.getHttpClient;

/**
 * Created by hemant on 07/01/2019.
 */

@SuppressWarnings("ALL")
public class InternetHelper extends AsyncTask<String, Void, String>{

    String text = "UNDEFINED";
    String previousImageSrc="UNDEFINED";
    String methodIdentifier;
    public static String auth_token, mobile_no, user_id, OTP, country_code, profile_image_url, device_token;
    Context context;
    public static int count=0;
    public static JSONObject jsonObject, jsonObjectWelcomeActivity;
    public static LinkedHashMap<String,String> metadata = new LinkedHashMap<String, String>();
    String ts;
    String[] data_array;

    TrustManager[] trustAllCerts = new TrustManager[]{
            new X509TrustManager() {

                public java.security.cert.X509Certificate[] getAcceptedIssuers()
                {
                    return null;
                }
                public void checkClientTrusted(java.security.cert.X509Certificate[] certs, String authType)
                {
                    //No need to implement.
                }
                public void checkServerTrusted(java.security.cert.X509Certificate[] certs, String authType)
                {
                    //No need to implement.
                }
            }
    };

    public InternetHelper(Context context) {
        try {
            this.context = context.getApplicationContext();
            ts = new SimpleDateFormat("yyyy.MM.dd.HH.mm.ss").format(new Date());
        }catch (Exception e){
            e.printStackTrace();
//            Log.e("",e.getMessage());
        }
    }

    @Override
    protected String doInBackground(String... strings) {

        data_array=strings;
        methodIdentifier = strings[1];

        text= updateServer(strings);
        return text;
    }

    @Override
    protected void onPreExecute() {

        try {
            if(methodIdentifier=="Load Comment")
            {
                // LoadComments.progressBar.setVisibility(View.VISIBLE);
            }

        }catch (Exception e)
        {
            e.printStackTrace();
        }
    }

    @Override
    protected void onPostExecute(String result) {
        try {

         //  Toast.makeText(context, result, Toast.LENGTH_SHORT).show();
            if (result.isEmpty() || result.length() == 0 ||
                    result.equals("") || result.toString() == null) {

                Toast.makeText(context, "There seems to be an error while communicating with server. " +
                        "Please check your internet connection and try again", Toast.LENGTH_SHORT).show();
            }
            else if (result == "Timeout")
            {
                Toast.makeText(context, "Internet Connection is too slow. " +
                        "Please connect with a working internet connection.", Toast.LENGTH_LONG).show();
                if(methodIdentifier.equals("login"))
                {
                    LoginActivity.instance.showSnackBar("Please try again");
                }
                else if(methodIdentifier.equals("add_response"))
                {
                    if(Constants.skip_thankYouPage) {
                    }
                    else {
                        Feedback.instance.showSnackBar("Server not responding." +
                                " Please ask administrator to look into it. " +
                                "Also please check your internet connection.");
                    }
                }
                else if(methodIdentifier.equals("get_campaign"))
                {
                    WelcomeActivity.instance.showSnackBar("Server not responding." +
                            " Please ask administrator to look into it. " +
                            "Also please check your internet connection.");
                }
                else if(methodIdentifier.equals("survey"))
                {
                    Survey.instance.showSnackBar();
                }
                else if(methodIdentifier.equals("add_tablet"))
                {
                    TabletSettings.instance.showSnackBar("An error occured. Please try again", "add_tablet");
                }
                else if(methodIdentifier.equals("check_password"))
                {
                    Toast.makeText(context, "An error occured, please try again.", Toast.LENGTH_SHORT).show();
                }
                else if(methodIdentifier.equals("check_tablet"))
                {
                    TabletSettings.instance.showSnackBar("An error occured. Please try again", "check_tablet");
                }
                else if(methodIdentifier.equals("get_emp_record"))
                {
                    Verification.instance.showSnackBar("An error occured. Please try again");
                }
            }
            else if(result=="folder" || result=="UNDEFINED" || result=="exist" || result=="not exist" )
            {

                if(methodIdentifier.equals("login"))
                {
                   LoginActivity.instance.showSnackBar("Can not connect to server. Please try again.");
                }
                else if(methodIdentifier.equals("get_campaign"))
                {
                    WelcomeActivity.instance.showSnackBar("Not able to connect to server." +
                            " Please check your internet connection and try again");
                }
                else if(methodIdentifier.equals("add_response"))
                {
                    if(Constants.skip_thankYouPage)
                    {

                    }
                    else {
                        Feedback.instance.showSnackBar("Not able to connect to server." +
                                " Please check your internet connection and try again");
                    }
                }
                else if(methodIdentifier.equals("survey"))
                {
                    Survey.instance.showSnackBar();
                }
                else if(methodIdentifier.equals("add_tablet"))
                {
                    TabletSettings.instance.showSnackBar("An error occured. Please try again", "add_tablet");
                }
                else if(methodIdentifier.equals("check_password"))
                {
                    Toast.makeText(context, "An error occured, please try again.", Toast.LENGTH_SHORT).show();
                }
                else if(methodIdentifier.equals("check_tablet"))
                {
                    TabletSettings.instance.showSnackBar("An error occured. Please try again", "check_tablet");
                }
                else if(methodIdentifier.equals("get_emp_record"))
                {
                    Verification.instance.showSnackBar("An error occured. Please try again");
                }
            }
            else {
                jsonObject = (JSONObject) new JSONObject(result);
                System.out.print(jsonObject);
                String success = null;

                if (jsonObject.isNull("success")) {
                    // if null then do nothing
                }
                else
                {
                    success = jsonObject.getString("success");
                    if (success.equals("true")) {

                        if(methodIdentifier.equals("login")) {
                            LoginActivity.instance.loadMainScreen();
                        }
                        else if(methodIdentifier.equals("get_campaign"))
                        {
                            WelcomeActivity.instance.loadCampaignName(jsonObject);
                        }
                        else if(methodIdentifier.equals("survey"))
                        {
                            Survey.instance.OnDataReceived(jsonObject);
                        }
                        else if(methodIdentifier.equals("add_response"))
                        {
                            if(Constants.skip_thankYouPage) {
                                Constants.skip_thankYouPage=false;
                            }
                            else {
                                Feedback.instance.RecordInserted();
                            }
                        }
                        else if(methodIdentifier.equals("add_tablet"))
                        {
                            TabletSettings.instance.tabletAddedSuccessfully();
                        }


                        else if(methodIdentifier.equals("get_survey_type"))
                        {
                            Verification.instance.surveyDetailsFound(jsonObject);
                        }
                        else if(methodIdentifier.equals("survey_multioptions"))
                        {
                            Survey_MultiOption.instance.surveyDetailsReceived(jsonObject);
                        }
                        else if(methodIdentifier.equals("check_password"))
                        {
                            Intent i = new Intent(context, Settings.class);
                            i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                            i.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
                            context.startActivity(i);
                        }
                        else if(methodIdentifier.equals("check_tablet"))
                        {
                            TabletSettings.instance.tabletExist(jsonObject);
                        }
                        else if(methodIdentifier.equals("get_emp_record"))
                        {
                            Verification.instance.empFound(jsonObject);
                        }
                    }
                    else if(jsonObject.getString("success").equals("false"))
                    {
                       if(methodIdentifier.equals("add_tablet"))
                       {
                           if (jsonObject.getString("message").equals("Tablet Already Exist")) {
                               TabletSettings.instance.showSnackBar("Name already exit. Please choose a different name", "add_tablet");
                           }
                           else
                           {
                               TabletSettings.instance.showSnackBar("An error occured. Please try again", "add_tablet");
                           }
                       }
                       else if(methodIdentifier.equals("get_campaign"))
                       {
                           if (jsonObject.getString("message").equals("No Campaign")) {
                               WelcomeActivity.instance.showSnackBar("No Active Campaign Found." +
                                       " Please ask the administrator to configure one");
                           }
                           else
                           {
                               WelcomeActivity.instance.showSnackBar("An error occured. Please try again");
                           }
                       }
                       else if(methodIdentifier.equals("check_tablet"))
                       {
                           if(jsonObject.getString("message").equals("Tablet not found")) {
                               TabletSettings.instance.tabletNotFound();
                           }
                       }
                       else if(methodIdentifier.equals("login")) {

                           if(jsonObject.getString("message").equals("User Not Found")) {
                               LoginActivity.instance.showSnackBar("Username or password seems to be incorrect. Please try again");
                           }
                           else
                           {
                               LoginActivity.instance.showSnackBar("Please try again");
                           }
                       }
                       else if(methodIdentifier.equals("check_password"))
                       {
                           Toast.makeText(context, "Please check your password and try again", Toast.LENGTH_SHORT).show();
                       }
                       else if(methodIdentifier.equals("get_emp_record"))
                       {
                           if (jsonObject.getString("message").equals("Employee Not Found")) {
                               Verification.instance.empNotFound();
                           }
                           else
                           {
                               Verification.instance.showSnackBar("An error occured. Please try again");
                           }
                       }
                    }
                    else{
                        Toast.makeText(context, "There seems to be an error while communicating with server. " +
                                "Please check your internet connection and try again", Toast.LENGTH_SHORT).show();
                    }
                }
            }
        }
        catch (Exception e)
        {
            e.printStackTrace();
        }
        //   }
    }

    private String updateServerByGetRequest(String [] str_array)
    {
        try {

            String u = str_array[0];
            URL obj = new URL(u);
            HttpURLConnection con = (HttpURLConnection) obj.openConnection();

            // optional default is GET
            con.setRequestMethod("GET");

            String auth_token = context.getSharedPreferences("PREFERENCE",MODE_PRIVATE).getString("auth_token","");
            String device_token = context.getSharedPreferences("PREFERENCE",MODE_PRIVATE).getString("device_token","");

            System.out.print(auth_token);
            System.out.print(device_token);

            //add request header
           // con.setRequestProperty("User-Agent", USER_AGENT);
            con.setRequestProperty("Authorization",
                    context.getSharedPreferences("PREFERENCE",MODE_PRIVATE).getString("auth_token",""));

            con.setRequestProperty("device_token",
                    context.getSharedPreferences("PREFERENCE",MODE_PRIVATE).getString("device_token",""));

            int responseCode = con.getResponseCode();
            System.out.println("\nSending 'GET' request to URL : " + str_array[0]);
            System.out.println("Response Code : " + responseCode);

            BufferedReader in = new BufferedReader(
                    new InputStreamReader(con.getInputStream()));
            String inputLine;
            StringBuffer response = new StringBuffer();

            while ((inputLine = in.readLine()) != null) {
                response.append(inputLine);
            }
            in.close();

            text = response.toString();
            //print result
            System.out.println(response.toString());

        }
        catch (Exception  e)
        {
            e.printStackTrace();
            return e.toString();
        }

        return text;
    }

    private String updateServer(String[] str_array) {

        LinkedHashMap<String, Object> hmap = new LinkedHashMap<>();
        try {

            URL url = new URL(str_array[0]);
            trustAllHosts();
           URLConnection conn = (HttpURLConnection) url.openConnection();
//         HttpsURLConnection conn = (HttpsURLConnection) url.openConnection();
//            conn.setHostnameVerifier(DO_NOT_VERIFY);
            // Send POST data request
          /*  SSLContext sc = SSLContext.getInstance("SSL");
            sc.init(null, trustAllCerts, new java.security.SecureRandom());
            HttpsURLConnection.setDefaultSSLSocketFactory(sc.getSocketFactory());
            URLConnection conn = (HttpURLConnection) url.openConnection();*/

           // HttpClient httpClient =  getHttpClient(context, R.raw.server, true);
          //  HttpPost httppost = new HttpPost(str_array[0]);

          //  HttpsURLConnection conn = (HttpsURLConnection) url.openConnection();
            //URLConnection conn = (HttpsURLConnection) url.openConnection();

            //URLConnection conn = (HttpsURLConnection) url.openConnection();

           // URLConnection conn = setUpHttpsConnection(str_array[0]);

         /*   SSLContext context = SSLContext.getInstance("TLS");
            TrustManager[] tmlist = {new MyTrustManager()};
            context.init(null, tmlist, null);
            conn.setSSLSocketFactory(context.getSocketFactory());*/

            if (str_array[1] == "login") {
                //       hmap.put("email", str_array[2]);
                hmap.put("user_name", str_array[2]);
                hmap.put("passwd", str_array[3]);
            }
            else if(str_array[1]=="device_status")
            {
                hmap.put("battery_status", str_array[2]);
                hmap.put("uuid", str_array[3]);
            }
            else if(methodIdentifier.equals("survey_multioptions"))
            {
               // Toast.makeText(context, "survey_id:" +str_array[2], Toast.LENGTH_SHORT).show();
                hmap.put("survey_id", str_array[2]);
            }
            else if(str_array[1].equals("get_survey_type"))
            {
                hmap.put("campaign_id", str_array[2]);
               /// hmap.put()
            }
            else if(str_array[1].equals("get_emp_record"))
            {
                hmap.put("emp_id", str_array[2]);
            }
            else if(str_array[1].equals("check_tablet"))
            {
                hmap.put("uuid", str_array[2]);
            }
            else if(str_array[1].equals("check_password"))
            {
                hmap.put("password", str_array[2]);
                hmap.put("tablet_name", str_array[3]);
            }
            else if(str_array[1].equals("add_tablet"))
            {
                hmap.put("tablet_name", str_array[2]);
                hmap.put("tablet_location", str_array[3]);
                hmap.put("tablet_area", str_array[4]);
                hmap.put("uuid",str_array[5]);
            }
            else if(str_array[1].equals("add_exception"))
            {
                hmap.put("line_no", str_array[2]);
                hmap.put("activity", str_array[3]);
                hmap.put("exception", str_array[4]);
            }
            else if(str_array[1].equals("survey")){
                if(str_array[2].equals("category")) {
                    hmap.put("identifier", "category");
                    hmap.put("campaign_id", str_array[4]);
                }
                else if(str_array[2].equals("subcategory"))
                {
                    hmap.put("identifier", str_array[2]);
                    hmap.put("category_id", Integer.valueOf(str_array[3]));
                }
                else if(str_array[2].equals("issues"))
                {
                    hmap.put("identifier", str_array[2]);
                    hmap.put("subcategory_id", Integer.valueOf(str_array[3]));
                }
                else if(str_array[2].equals("options"))
                {
                    hmap.put("identifier", str_array[2]);
                    hmap.put("issue_id", Integer.valueOf(str_array[3]));
                }
            }
            else if(str_array[1].equals("add_response"))
            {
                hmap.put("category", str_array[2]);
                hmap.put("subcategory", str_array[3]);
                hmap.put("issue", str_array[4]);
                hmap.put("option", str_array[5]);
                hmap.put("rating", Integer.valueOf(str_array[6]));
                hmap.put("comment",str_array[7]);
                hmap.put("user_id", str_array[8]);
                hmap.put("campaign_id", str_array[9]);
                hmap.put("survey_id", str_array[10]);
                hmap.put("multi_option", str_array[11]);
                hmap.put("tablet_uuid", str_array[12]);
                Log.i("TOTAL ARRAY", Arrays.toString(str_array));
            }
            JSONObject SendMobileInfoToGetOTPJSONObj = new JSONObject(hmap);
            System.out.print(SendMobileInfoToGetOTPJSONObj);
            conn.setDoOutput(true);
            conn.setRequestProperty("Content-Type", "application/json");
            conn.setRequestProperty("Accept", "application/json");

            /*conn.setRequestProperty("Authorization",
                    context.getSharedPreferences("PREFERENCE",
                            MODE_PRIVATE).getString("auth_token", ""));
            conn.setRequestProperty("device_token",
                    context.getSharedPreferences("PREFERENCE",
                            MODE_PRIVATE).getString("device_token", ""));*/

            if (methodIdentifier.equals("CreatePost")) {
            } else {
                conn.setConnectTimeout(30000); // choose your own timeframe
                conn.setReadTimeout(30000); // choose your own timeframe
            }

            conn.connect();
            OutputStreamWriter wr = new OutputStreamWriter(conn.getOutputStream());
            wr.write(SendMobileInfoToGetOTPJSONObj.toString());
            System.out.print(SendMobileInfoToGetOTPJSONObj.toString());
            wr.flush();

            BufferedReader reader = new BufferedReader(new InputStreamReader(conn.getInputStream()));
            StringBuilder sb = new StringBuilder();
            String line = null;
            // Read Server Response
            while ((line = reader.readLine()) != null) {
                // Append server response in string
                sb.append(line + "\n");
               text = sb.toString();
            }
        } catch (SocketTimeoutException e) {
            e.printStackTrace();
            return text;
        } catch (EOFException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        } catch (Exception e) {
            e.printStackTrace();
            // Toast.makeText(context,"No network, please connect to internet", Toast.LENGTH_SHORT).show();
            return text;
        }

        return text;
    }

    // always verify the host - dont check for certificate
    final static HostnameVerifier DO_NOT_VERIFY = new HostnameVerifier() {
        public boolean verify(String hostname, SSLSession session) {
            return true;
        }
    };

    /**
     * Trust every server - dont check for any certificate
     */
    private static void trustAllHosts() {
        // Create a trust manager that does not validate certificate chains
        TrustManager[] trustAllCerts = new TrustManager[] { new X509TrustManager() {
            public java.security.cert.X509Certificate[] getAcceptedIssuers() {
                return new java.security.cert.X509Certificate[] {};
            }

            public void checkClientTrusted(X509Certificate[] chain,
                                           String authType) throws CertificateException {
            }

            public void checkServerTrusted(X509Certificate[] chain,
                                           String authType) throws CertificateException {
            }
        } };

        // Install the all-trusting trust manager
        try {
            SSLContext sc = SSLContext.getInstance("TLS");
            sc.init(null, trustAllCerts, new java.security.SecureRandom());
            HttpsURLConnection
                    .setDefaultSSLSocketFactory(sc.getSocketFactory());
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

}
