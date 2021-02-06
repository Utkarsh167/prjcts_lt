package graymars.feedibk.com.myapplication.Services;

import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.os.IBinder;
import android.support.annotation.Nullable;
import android.util.Log;

import java.util.Timer;
import java.util.TimerTask;

import graymars.feedibk.com.myapplication.Activities.WelcomeActivity;
import graymars.feedibk.com.myapplication.Constants;

/**
 * Created by kunal on 15/01/2018.
 */
public class BackgroundService extends Service {

    public int counter=0;
    public static final String TAG = BackgroundService.class.getSimpleName();

    public BackgroundService(Context applicationContext) {
        super();
        Log.i(TAG, "here I am!");
    }

    public BackgroundService() {
    }
    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        super.onStartCommand(intent, flags, startId);
        startTimer();
        return START_STICKY;
    }
    @Override
    public void onDestroy() {
        super.onDestroy();
        Log.i(TAG, "onDestroy");
        // send new broadcast when service is destroyed.
        // this broadcast restarts the service.
        Intent broadcastIntent = new Intent("uk.ac.shef.oak.ActivityRecognition.RestartSensor");
        sendBroadcast(broadcastIntent);
        stoptimertask();
    }

    private Timer timer;
    private TimerTask timerTask;
    long oldTime=0;


    public void startTimer() {
        //set a new Timer
        timer = new Timer();

        //initialize the TimerTask's job
        initializeTimerTask();

        //schedule the timer, to wake up every 1 second
        timer.schedule(timerTask, 5000, 5000); //
    }

    /**
     * it sets the timer to print the counter every x seconds
     */
    public void initializeTimerTask() {
        timerTask = new TimerTask() {
            public void run() {
                counter=counter+5;
                Log.i("in timer", "in timer ++++  "+ (counter));
                String[] stringrray = new String[]{Constants.base_url+"xp_android/get_survey_details", "getSurvey",
                        getSharedPreferences("PREFERENCE", MODE_PRIVATE).getString("tablet_id","")};
                new InternetHelper(BackgroundService.this).execute(stringrray);
            }
        };
    }

    /**
     * not needed
     */
    public void stoptimertask() {
        //stop the timer, if it's not already null
        if (timer != null) {
            timer.cancel();
            timer = null;
        }
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}