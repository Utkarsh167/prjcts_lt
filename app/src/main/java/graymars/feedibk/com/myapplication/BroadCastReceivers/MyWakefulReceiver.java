package graymars.feedibk.com.myapplication.BroadCastReceivers;

import android.content.Context;
import android.content.Intent;
import android.support.v4.content.WakefulBroadcastReceiver;

import graymars.feedibk.com.myapplication.Services.MyIntentService;

import static com.google.android.gms.stats.GCoreWakefulBroadcastReceiver.startWakefulService;

public class MyWakefulReceiver extends WakefulBroadcastReceiver {

    @Override
    public void onReceive(Context context, Intent intent) {

        // Start the service, keeping the device awake while the service is
        // launching. This is the Intent to deliver to the service.
        Intent service = new Intent(context, MyIntentService.class);
        startWakefulService(context, service);

    }
}