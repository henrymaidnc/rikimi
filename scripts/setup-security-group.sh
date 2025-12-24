#!/bin/bash

# Source the configuration
source ./aws-config.sh

# Create security group
SECURITY_GROUP_ID=$(aws ec2 create-security-group \
    --group-name $SECURITY_GROUP_NAME \
    --description "$SECURITY_GROUP_DESCRIPTION" \
    --vpc-id $VPC_ID \
    --query 'GroupId' \
    --output text)

echo "Created security group with ID: $SECURITY_GROUP_ID"

# Allow SSH
aws ec2 authorize-security-group-ingress \
    --group-id $SECURITY_GROUP_ID \
    --protocol tcp \
    --port 22 \
    --cidr 0.0.0.0/0

# Allow Kubernetes API
aws ec2 authorize-security-group-ingress \
    --group-id $SECURITY_GROUP_ID \
    --protocol tcp \
    --port 6443 \
    --cidr 0.0.0.0/0

# Allow HTTP
aws ec2 authorize-security-group-ingress \
    --group-id $SECURITY_GROUP_ID \
    --protocol tcp \
    --port 80 \
    --cidr 0.0.0.0/0

# Allow HTTPS
aws ec2 authorize-security-group-ingress \
    --group-id $SECURITY_GROUP_ID \
    --protocol tcp \
    --port 443 \
    --cidr 0.0.0.0/0

# Allow etcd
aws ec2 authorize-security-group-ingress \
    --group-id $SECURITY_GROUP_ID \
    --protocol tcp \
    --port 2379-2380 \
    --cidr 0.0.0.0/0

# Allow Kubelet
aws ec2 authorize-security-group-ingress \
    --group-id $SECURITY_GROUP_ID \
    --protocol tcp \
    --port 10250 \
    --cidr 0.0.0.0/0

# Allow kube-scheduler
aws ec2 authorize-security-group-ingress \
    --group-id $SECURITY_GROUP_ID \
    --protocol tcp \
    --port 10251 \
    --cidr 0.0.0.0/0

# Allow kube-controller-manager
aws ec2 authorize-security-group-ingress \
    --group-id $SECURITY_GROUP_ID \
    --protocol tcp \
    --port 10252 \
    --cidr 0.0.0.0/0

# Allow Calico
aws ec2 authorize-security-group-ingress \
    --group-id $SECURITY_GROUP_ID \
    --protocol tcp \
    --port 179 \
    --cidr 0.0.0.0/0

aws ec2 authorize-security-group-ingress \
    --group-id $SECURITY_GROUP_ID \
    --protocol udp \
    --port 4789 \
    --cidr 0.0.0.0/0

# Save the security group ID to a file for later use
echo "export SECURITY_GROUP_ID=$SECURITY_GROUP_ID" >> ./aws-config.sh

echo "Security group setup completed. ID: $SECURITY_GROUP_ID" 