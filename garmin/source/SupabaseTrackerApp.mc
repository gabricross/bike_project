import Toybox.Application;
import Toybox.Position;
import Toybox.Communications;
import Toybox.Timer;
import Toybox.System;

class SupabaseTrackerApp extends Application.AppBase {

    var timer;
    var lastLat = 0.0;
    var lastLon = 0.0;

    // Configuración de Supabase
    const SUPABASE_URL = "https://mcwcpycazdhudfdltzrg.supabase.co/rest/v1/active_riders";
    const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1jd2NweWNhemRodWRmZGx0enJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4NTQ1NTQsImV4cCI6MjA5NDQzMDU1NH0.lV7r5Gca4CLW-Dg6XSSok1i8coI-ZmP5yIvQKot_Tw0";
    const RIDER_ID = "garmin_user_001";

    function initialize() {
        AppBase.initialize();
    }

    function onStart(state) {
        Position.enableLocationEvents(Position.LOCATION_CONTINUOUS, method(:onPositionUpdate));
        timer = new Timer.Timer();
        timer.start(method(:sendLocationToSupabase), 5000, true);
    }

    function onStop(state) {
        Position.enableLocationEvents(Position.LOCATION_DISABLE, method(:onPositionUpdate));
        if (timer != null) {
            timer.stop();
        }
    }

    function onPositionUpdate(info) {
        if (info != null && info.position != null) {
            var coords = info.position.toDegrees();
            lastLat = coords[0];
            lastLon = coords[1];
        }
    }

    function sendLocationToSupabase() {
        if (lastLat == 0.0 && lastLon == 0.0) {
            System.println("Esperando señal GPS...");
            return;
        }

        var params = {
            "rider_id" => RIDER_ID,
            "latitude" => lastLat,
            "longitude" => lastLon
        };

        var options = {
            :method => Communications.HTTP_REQUEST_METHOD_POST,
            :headers => {
                "Content-Type" => "application/json",
                "apikey" => ANON_KEY,
                "Authorization" => "Bearer " + ANON_KEY,
                "Prefer" => "resolution=merge-duplicates"
            },
            :responseType => Communications.HTTP_RESPONSE_CONTENT_TYPE_JSON
        };

        Communications.makeWebRequest(SUPABASE_URL, params, options, method(:onReceiveResponse));
    }

    function onReceiveResponse(responseCode, data) {
        if (responseCode == 200 || responseCode == 201) {
            System.println("Ubicación actualizada correctamente en Supabase.");
        } else {
            System.println("Error HTTP: " + responseCode);
        }
    }

    function getInitialView() {
        return [ new SupabaseTrackerView() ];
    }
}
