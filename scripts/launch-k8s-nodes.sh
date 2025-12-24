#!/bin/bash

# Source the configuration
source ./aws-config.sh

# Launch Master Node
aws ec2 run-instances \
    --image-id ami-0c7217cdde317cfec \
    --instance-type $MASTER_INSTANCE_TYPE \
    --key-name $KEY_NAME \
    --security-group-ids $SECURITY_GROUP_ID \
    --subnet-id $SUBNET_ID \
    --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=k8s-master}]' \
    --block-device-mappings 'DeviceName=/dev/sda1,Ebs={VolumeSize=20,VolumeType=gp3}' \
    --count 1

# Launch Worker Nodes
aws ec2 run-instances \
    --image-id ami-0c7217cdde317cfec \
    --instance-type $WORKER_INSTANCE_TYPE \
    --key-name $KEY_NAME \
    --security-group-ids $SECURITY_GROUP_ID \
    --subnet-id $SUBNET_ID \
    --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=k8s-worker}]' \
    --block-device-mappings 'DeviceName=/dev/sda1,Ebs={VolumeSize=20,VolumeType=gp3}' \
    --count $INSTANCE_COUNT 