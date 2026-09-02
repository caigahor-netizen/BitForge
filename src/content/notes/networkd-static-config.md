---
title: Static IP with systemd-networkd
description: A minimal, reproducible network config for headless Linux
category: Linux
pubDate: 2025-07-30
---

## Minimal example

For a headless box that should always come up on the same address:

```ini
# /etc/systemd/network/10-eth0.network
[Match]
Name=eth0

[Network]
Address=192.168.1.50/24
Gateway=192.168.1.1
DNS=1.1.1.1
```

Then `networkctl reload`. Declarative, inspectable, and easy to version in the same repo as the rest of the system config.

*Placeholder note — more networking write-ups to follow.*
