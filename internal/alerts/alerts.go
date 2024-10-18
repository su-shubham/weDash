package alerts

import (
    "fmt"
)

var consecutiveAlerts = 0

func CheckAndAlert(city string, temp, threshold float64, consecutiveLimit int) {
    if temp > threshold {
        consecutiveAlerts++
    } else {
        consecutiveAlerts = 0
    }

    if consecutiveAlerts >= consecutiveLimit {
        // Trigger an alert
        fmt.Printf("ALERT! Temperature in %s exceeded %v°C for %d consecutive updates.\n", city, threshold, consecutiveLimit)
        consecutiveAlerts = 0
    }
}
