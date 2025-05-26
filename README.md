# Honey-Badger Detection – Back-End

This project is the **cloud glue** for a low-power wildlife-deterrent system.  
When an ESP32-CAM spots motion it:

1. snaps two JPEG pictures,  
2. uploads them to **Dropbox**,  
3. then polls this back-end for a decision.

The back-end (this repo) listens for the Dropbox webhook, asks **Azure Custom Vision** whether a *honey-badger* is in either picture, saves the highest confidence in a tiny in-memory cache, and finally answers the ESP32 with a one-line JSON payload:

```json
{ "confidence": 0.87 }
