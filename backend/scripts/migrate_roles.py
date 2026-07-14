"""Migrate user roles from old naming to new naming.

Old roles:  admin          -> staff_admin
            super_admin    -> owner
"""
import sqlite3
import sys
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "..", "database", "almex.db")

def migrate():
    if not os.path.exists(DB_PATH):
        print(f"[ERROR] Database not found: {DB_PATH}")
        sys.exit(1)

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Show current roles before migration
    cursor.execute("SELECT role, COUNT(*) FROM users GROUP BY role")
    print("[BEFORE] Current roles:")
    for role, count in cursor.fetchall():
        print(f"  - {role}: {count} user(s)")

    # Migrate super_admin -> owner
    cursor.execute("UPDATE users SET role = 'owner' WHERE role = 'super_admin'")
    updated_owner = cursor.rowcount

    # Migrate admin -> staff_admin
    cursor.execute("UPDATE users SET role = 'staff_admin' WHERE role = 'admin'")
    updated_staff = cursor.rowcount

    conn.commit()

    # Show roles after migration
    cursor.execute("SELECT role, COUNT(*) FROM users GROUP BY role")
    print("\n[AFTER] Current roles:")
    for role, count in cursor.fetchall():
        print(f"  - {role}: {count} user(s)")

    conn.close()

    print(f"\n[OK] Migration complete:")
    print(f"  - {updated_owner} user(s) changed from 'super_admin' -> 'owner'")
    print(f"  - {updated_staff} user(s) changed from 'admin' -> 'staff_admin'")

if __name__ == "__main__":
    migrate()
