#!/bin/bash

# AWS Configuration
export AWS_REGION="us-east-1"  # Change this to your region
export VPC_ID="vpc-07b0c3618bf028b8f"   # Replace with your VPC ID
export SUBNET_ID="subnet-06badec02274d1c3b"  # Replace with your subnet ID
export KEY_NAME="rikiki_key_pair"  # Replace with your key pair name

# Security Group Configuration
export SECURITY_GROUP_NAME="k8s-cluster-sg"
export SECURITY_GROUP_DESCRIPTION="Security group for Kubernetes cluster"

# Instance Configuration
export MASTER_INSTANCE_TYPE="t3.medium"
export WORKER_INSTANCE_TYPE="t3.small"
export INSTANCE_COUNT=2  # Number of worker nodes export SECURITY_GROUP_ID=sg-06e20432bc75f1ddc
