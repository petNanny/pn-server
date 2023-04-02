pipeline {
    agent any
    environment {
        AWS_REGION = 'ap-southeast-2'
        ECR_REPO = '312518712322.dkr.ecr.ap-southeast-2.amazonaws.com'
        IMAGE_REPO_NAME = 'pn-app'
        IMAGE_NAME = 'pn-app'
        IMAGE_TAG = "${env.BUILD_NUMBER}"
        ECS_CLUSTER = 'pn-server'
        ECS_SERVICE_NAME = 'pn-server'
        TASK_DEFINITION_FAMILY = 'pn-server'
        ECS_COMPATIBILITY = 'FARGATE'
        ECS_NETWORK_MODE = 'awsvpc'

        // Load credentials from Jenkins
        MONGO_CONNECTION_STRING=credentials('MONGO_CONNECTION_STRING')
        PORT=credentials('PORT')
        ACCESS_TOKEN_SECRET=credentials('ACCESS_TOKEN_SECRET')
        REFRESH_TOKEN_SECRET=credentials('REFRESH_TOKEN_SECRET')
        TEST_PORT=credentials('TEST_PORT')
        MONGO_CONNECTION_STRING_TEST_DB=credentials('MONGO_CONNECTION_STRING_TEST_DB')
        AWS_ACCESS_KEY_ID=credentials('AWS_ACCESS_KEY_ID')
        AWS_SECRET_ACCESS_KEY=credentials('AWS_SECRET_ACCESS_KEY')
        AWS_BUCKET_NAME=credentials('AWS_BUCKET_NAME')
        AWS_BUCKET_REGION=credentials('AWS_BUCKET_REGION')
        JWT_KEY=credentials('JWT_KEY')
        EMAIL_SERVICE=credentials('EMAIL_SERVICE')
        EMAIL_USER=credentials('EMAIL_USER')
        EMAIL_PASS=credentials('EMAIL_PASS')
        EMAIL_VERIFY_LINK=credentials('EMAIL_VERIFY_LINK')
    }
    
    stages {

        stage('Git checkout') {
            steps {
                // Get source code from a GitHub repository
                git branch:'dev', url:'https://github.com/petNanny/pn-server.git'
            }
        }
    
        stage('Login to ECR') {
            steps {
                echo 'Logging into ECR'
                withAWS(credentials: 'aws_pn', region: 'ap-southeast-2') {
                    sh'aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_REPO}'
                }
                
            }
        }

        stage('Build and push image') {
            steps {
                script {
                    echo 'Building and pushing the Docker image to ECR'
                    // Push image to ECR
                    sh'docker build -t ${IMAGE_NAME} --build-arg MONGO_CONNECTION_STRING=$MONGO_CONNECTION_STRING --build-arg PORT=$PORT --build-arg ACCESS_TOKEN_SECRET=$ACCESS_TOKEN_SECRET --build-arg REFRESH_TOKEN_SECRET=$REFRESH_TOKEN_SECRET --build-arg TEST_PORT=$TEST_PORT --build-arg MONGO_CONNECTION_STRING_TEST_DB=$MONGO_CONNECTION_STRING_TEST_DB --build-arg AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID --build-arg AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY --build-arg AWS_BUCKET_NAME=$AWS_BUCKET_NAME --build-arg AWS_BUCKET_REGION=$AWS_BUCKET_REGION --build-arg JWT_KEY=$JWT_KEY --build-arg EMAIL_SERVICE=$EMAIL_SERVICE --build-arg EMAIL_USER=$EMAIL_USER --build-arg EMAIL_PASS=$EMAIL_PASS --build-arg EMAIL_VERIFY_LINK=$EMAIL_VERIFY_LINK --no-cache .'
                    
                    // Build and tag Docker image
                    sh'docker tag ${IMAGE_NAME}:latest ${ECR_REPO}/${IMAGE_REPO_NAME}:${IMAGE_TAG}'
                    
                    // Push image to ECR
                    sh'docker push ${ECR_REPO}/${IMAGE_REPO_NAME}:${IMAGE_TAG}'
                }    
            }
        }

        stage('Deploy to ECS') {
            steps {
                echo'Deploying to ECS'
                withAWS(credentials: 'aws_pn', region: 'ap-southeast-2') {
                    script {
                        //Get current task definition in JSON file
                        sh "aws ecs describe-task-definition --task-definition \$(aws ecs describe-services --cluster ${ECS_CLUSTER} --services ${ECS_SERVICE_NAME} --query 'services[0].taskDefinition' --output text) --output json > task_definition.json"
                        sh "cat task_definition.json" 
                        
                        // Extract the current image tag from the JSON file
                        def CURRENT_IMAGE_TAG = sh(script: "(jq -r '.taskDefinition.containerDefinitions[0].image | split(\":\") | .[-1]' task_definition.json)", returnStdout: true).trim()
                        echo "Current image tag is ${CURRENT_IMAGE_TAG}"
                        
                        //Change the image tag in the JSON file
                        sh "sed -i \"s/:${CURRENT_IMAGE_TAG}/:${IMAGE_TAG}/g\" task_definition.json"
                        sh "cat task_definition.json"
                        
                        //Create contain definition JSON file
                        sh "jq '.taskDefinition | {containerDefinitions: .containerDefinitions, family: .family, cpu: .cpu, memory: .memory}' task_definition.json > container_task_definition.json"
                        sh "cat container_task_definition.json"
                        
                        // Register the new task 
                        sh "aws ecs register-task-definition --execution-role-arn arn:aws:iam::312518712322:role/ecsTaskExecutionRole --network-mode ${ECS_NETWORK_MODE} --requires-compatibilities ${ECS_COMPATIBILITY} --cli-input-json file://container_task_definition.json --output json"
                       
                        // Update service to use new task Definition
                        sh "aws ecs update-service --cluster \${ECS_CLUSTER} --service \${ECS_SERVICE_NAME} --force-new-deployment --task-definition ${TASK_DEFINITION_FAMILY}" 
                    }
                    
                }
                
            }
        }

        stage('remove docker image') {
            steps {
                sh "docker rmi ${IMAGE_NAME}:latest"
            }
        }
        
    }
    
    post {
        always {
            cleanWs()
        }
    }
}