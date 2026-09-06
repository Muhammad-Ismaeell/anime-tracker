import threading


# SQLite permits only one writer at a time. A shared process-level lock prevents
# concurrent supplementary-data refreshes from colliding in development.
db_write_lock = threading.RLock()
