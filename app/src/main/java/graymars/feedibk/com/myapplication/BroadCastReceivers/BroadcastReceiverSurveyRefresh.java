package graymars.feedibk.com.myapplication.BroadCastReceivers;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.util.Log;

import graymars.feedibk.com.myapplication.Services.BackgroundService;

/**
 * Created by kunal on 15/01/2018.
 */
public class BroadcastReceiverSurveyRefresh extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        Log.i(BroadcastReceiverSurveyRefresh.class.getSimpleName(), "Broadcast Received");
        Log.i(BroadcastReceiverSurveyRefresh.class.getSimpleName(), "Restarting Service");
        context.startService(new Intent(context, BackgroundService.class));
    }
}