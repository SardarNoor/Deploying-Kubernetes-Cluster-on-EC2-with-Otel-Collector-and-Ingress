#  Kubernetes Cluster on AWS EC2 with Ingress & OpenTelemetry

## Project Overview

In this project, I designed and implemented a **self-managed Kubernetes cluster on AWS EC2 instances** using **kubeadm**. On top of the base cluster, I deployed a **custom Node.js UI application**, exposed it using an **NGINX Ingress Controller**, and implemented **distributed tracing using OpenTelemetry (OTel Collector)**.

This project demonstrates **real-world Kubernetes infrastructure skills** by avoiding managed services like EKS and instead focusing on how Kubernetes works internally.

---

## Architecture Diagram

![Kubernetes Architecture](Task16\(1\).PNG)

---

## What This Project Demonstrates

* Kubernetes cluster bootstrap using **kubeadm**
* Linux kernel & networking prerequisites
* Container runtime configuration using **containerd**
* Pod networking using **Weave Net (CNI)**
* Application deployment using **Deployments & Services**
* HTTP traffic routing using **NGINX Ingress**
* External access via **NodePort**
* Observability using **OpenTelemetry Collector**
* Practical troubleshooting of real Kubernetes issues

---

## Repository Structure

```
.
├── app/
│   ├── server.js
│   ├── tracing.js
│   ├── Dockerfile
│   └── package.json
│
├── k8s_manifest/
│   ├── app.yaml
│   ├── ingress.yaml
│   └── otel-collector.yaml
│
├── Task16(1).PNG
└── README.md
```

---

## Infrastructure Overview

### EC2 Nodes

| Role          | OS     |
| ------------- | ------ |
| Control Plane | Ubuntu |
| Worker Node 1 | Ubuntu |
| Worker Node 2 | Ubuntu |

All nodes are deployed inside the same VPC and secured using properly configured **Security Groups**.

---

## Security Group Configuration

### Control Plane

* SSH (22)
* Kubernetes API Server (6443)
* etcd ports (2379–2380)
* kubelet and controller ports
* Weave Net networking ports

### Worker Nodes

* SSH (22)
* kubelet (10250)
* Weave Net networking
* NodePort range (30000–32767)
* Ingress NodePort

---

## Phase 1 — OS Preparation (All Nodes)

Kubernetes requires swap to be disabled and certain kernel settings to be enabled.

```bash
sudo swapoff -a
sudo sed -i '/ swap / s/^/#/' /etc/fstab
```

Kernel modules required for container networking:

```bash
overlay
br_netfilter
```

Networking parameters were configured using sysctl to allow proper packet forwarding and iptables handling.

---

## Phase 2 — Install containerd (All Nodes)

`containerd` was chosen as the container runtime due to its lightweight and Kubernetes-native design.

Key steps:

* Install containerd
* Generate default configuration
* Restart and enable the service

This ensures Kubernetes can manage container lifecycles efficiently.

---

## Phase 3 — Install Kubernetes Components (All Nodes)

The following components were installed and version-locked:

* `kubeadm`
* `kubelet`
* `kubectl`

Version locking prevents accidental upgrades that can break cluster compatibility.

---

## Phase 4 — Initialize Control Plane

The Kubernetes control plane was initialized using:

```bash
kubeadm init
```

This step:

* Bootstraps the cluster
* Starts API server, scheduler, controller manager
* Generates the worker join command

kubectl access was configured using the admin kubeconfig.

---

## Phase 5 — Join Worker Nodes

Worker nodes were joined using the generated `kubeadm join` command.

After joining, all nodes appeared in **Ready** state.

---

## Phase 6 — Install Weave Net (CNI)

Weave Net was installed to enable pod-to-pod communication across nodes.

Without a CNI, pods remain in `Pending` state.

---

## Phase 7 — Deploy Node.js Application

### Container Image

The application image is hosted on **Docker Hub (public)**:

```
sardarnoor1/node-otel-ui:1.0
```

Docker Hub was used to avoid authentication complexity in a self-managed Kubernetes cluster.

---

### Kubernetes Deployment

The application was deployed using:

* Deployment (replicas for availability)
* ClusterIP Service (internal load balancing)

```bash
kubectl apply -f k8s_manifest/app.yaml
```

---

## Phase 8 — Install NGINX Ingress Controller

NGINX Ingress Controller was deployed to manage HTTP routing.

Because this is a self-managed cluster:

* `LoadBalancer` services remain in `Pending` state
* The controller was exposed using **NodePort**

---

## Phase 9 — Configure Ingress Rules

Ingress rules route incoming HTTP traffic to the Node.js service.

```bash
kubectl apply -f k8s_manifest/ingress.yaml
```

---

## Phase 10 — Install OpenTelemetry Collector

The OpenTelemetry Collector was deployed to receive application traces via OTLP.

```bash
kubectl apply -f k8s_manifest/otel-collector.yaml
```

The collector runs as:

* Deployment
* ClusterIP Service

---

## Phase 11 — Verify Application & Tracing

The application is accessed using:

```
http://<Worker_Public_IP>:<Ingress_NodePort>
```

User actions generate traces which are received and logged by the OpenTelemetry Collector.

---

## Problems Faced & How I Solved Them

### ImagePullBackOff

* **Cause:** ECR authentication issues in kubeadm
* **Solution:** Switched to Docker Hub public image

### Ingress Not Accessible

* **Cause:** Service type was not externally exposed
* **Solution:** Patched ingress controller to NodePort

### LoadBalancer Pending

* **Cause:** No cloud provider integration
* **Solution:** Used NodePort for external access

### OpenTelemetry Collector CrashLoopBackOff

* **Cause:** Deprecated exporter configuration
* **Solution:** Replaced with `debug` exporter

---

## Final Validation

```bash
kubectl get nodes
kubectl get pods -A
kubectl get svc
kubectl get ingress
kubectl logs deployment/otel-collector
```

All components were verified to be running successfully.

---

## Conclusion

This project demonstrates a **complete Kubernetes environment built from scratch** on AWS EC2, covering infrastructure, networking, application deployment, ingress routing, and observability.

It reflects **real-world DevOps problem-solving** and provides a strong foundation for production-grade Kubernetes understanding.

---

## Author

**Sardar Noor Ul Hassan**
DevOps / Cloud Engineer



Just tell me what to do next.
