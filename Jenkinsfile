pipeline {
    agent any
    environment {
        AWS_REGION = 'ap-southeast-2'
        ECR_REPO = '312518712322.dkr.ecr.ap-southeast-2.amazonaws.com'
        IMAGE_REPO_NAME = 'pn-app'
        IMAGE_TAG = 'latest'
        //IMAGE_TAG = sh(returnStdout: true, script: 'git rev-parse --short HEAD').trim()
        ECS_CLUSTER = 'pn-server-cluster'
        ECS_SERVICE_NAME = 'pn-server-service'
        TASK_DEFINITION = 'pn-server'

        // Load credentials from Jenkins
        MONGO_CONNECTION_STRING=credentials('MONGO_CONNECTION_STRING')
        PORT=credentials('PORT')
        ACCESS_TOKEN_SECRET=credentials('ACCESS_TOKEN_SECRET')
        REFRESH_TOKEN_SECRET=credentials('REFRESH_TOKEN_SECRET')
        TEST_PORT=credentials('TEST_PORT')
        MONGO_CONNECTION_STRING_TEST_DB=credentials('MONGO_CONNECTION_STRING_TEST_DB')
    }
    stages {
        stage('Git checkout') {
            steps{
                // Get source code from a GitHub repository
                git branch:'dev', url:'https://github.com/AbbyKuo/pn-server.git'
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
                echo 'Building and pushing the Docker image to ECR'
                // Push image to ECR
                sh'docker build -t ${IMAGE_REPO_NAME}:${IMAGE_TAG} --build-arg MONGO_CONNECTION_STRING=$MONGO_CONNECTION_STRING --build-arg PORT=$PORT --build-arg ACCESS_TOKEN_SECRET=$ACCESS_TOKEN_SECRET --build-arg REFRESH_TOKEN_SECRET=$REFRESH_TOKEN_SECRET --build-arg TEST_PORT=$TEST_PORT --build-arg MONGO_CONNECTION_STRING_TEST_DB=$MONGO_CONNECTION_STRING_TEST_DB --no-cache .'
                
                // Build and tag Docker image
                sh'docker tag ${IMAGE_REPO_NAME}:${IMAGE_TAG} ${ECR_REPO}/${IMAGE_REPO_NAME}:${IMAGE_TAG}'
                
                // Push image to ECR
                sh'docker push ${ECR_REPO}/${IMAGE_REPO_NAME}:${IMAGE_TAG}'
            }
        }
        stage('Deploy to ECS') {
            steps {
                echo'Deploying to ECS'
                withAWS(credentials: 'aws_pn', region: 'ap-southeast-2') {
                    script {
                        // Get current task Definition
                        def currentTaskDef = sh(script: "aws ecs describe-services --cluster ${ECS_CLUSTER} --services ${ECS_SERVICE_NAME} --query 'services[0].taskDefinition'", returnStdout:true).trim()
                        echo "Current task definition: ${currentTaskDef}"

                     // Create new task Definition with updated image
                        def newTaskDef = currentTaskDef.replaceAll("${IMAGE_REPO_NAME}:<CURRENT_VERSION>", "${ECR_REPO}/${IMAGE_REPO_NAME}:${IMAGE_TAG}")
                        echo "New task definition: ${newTaskDef}"

                        // Register new task definition
                        sh "echo '${newTaskDef}' > new-task-definition.json"
                        sh "aws ecs register-task-definition --cli-input-json file://new-task-definition.json"

                        // Update service to use new task Definition
                        sh "aws ecs update-service --cluster ${ECS_CLUSTER} --service ${ECS_SERVICE_NAME} --force-new-deployment --task-definition ${newTaskDef}"
                    }
                    
                }
                
            }
        }
    }
    post {
        always {
            cleanWs()
        }
    }   
}

