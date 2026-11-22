---
title: cello
summary: "A lightweight reverse proxy that exposes local services to the public internet."
weight: 2
cover:
  image: /images/cello.svg
  alt: cello system architecture diagram
  caption: "cello system architecture"
---

cello is a lightweight reverse proxy that exposes services running on your
machine to the public internet. Run the client next to a local server and it
gets a public URL like `https://k7m2xq.cello.example.com`. Requests to that
subdomain are forwarded through the tunnel to your local port.

Everything runs over a single port, so the client only needs to reach port 443.
I host a public server, so the released binaries work without any setup.

{{< stack "Go" "TCP" "Reverse Proxy" >}}

Source: [github.com/henockt/cello](https://github.com/henockt/cello)
