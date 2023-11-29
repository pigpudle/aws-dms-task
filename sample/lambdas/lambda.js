const AWS = require('aws-sdk');
const uuidv4 = require('uuid/v4');
var fs = require('fs');


// AWS.config.update({ region: 'us-east-1' });

const shortUid = () => uuidv4().substring(0, 8);

const LOCALSTACK_HOSTNAME = process.env.LOCALSTACK_HOSTNAME;
const ENDPOINT = `http://${LOCALSTACK_HOSTNAME}:4566`;
if (LOCALSTACK_HOSTNAME) {
  process.env.AWS_SECRET_ACCESS_KEY = 'test';
  process.env.AWS_ACCESS_KEY_ID = 'test';
}


const DYNAMODB_TABLE = 'documents';

const headers = {
  'content-type': 'application/json',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
};

const CLIENT_CONFIG = LOCALSTACK_HOSTNAME ? { endpoint: ENDPOINT } : {};

const connectDynamoDB = () => new AWS.DynamoDB(CLIENT_CONFIG);
const s3 = new AWS.S3({ ...CLIENT_CONFIG, s3ForcePathStyle: true });
s3.api.globalEndpoint = LOCALSTACK_HOSTNAME; // https://github.com/localstack/localstack/issues/8016

const getDocuments = async (payload, context, callback) => {
  try {
    const dynamodb = connectDynamoDB();
    const params = {
      TableName: DYNAMODB_TABLE,
    };
    const scanResult = await dynamodb.scan(params).promise();
    const items = scanResult['Items'].map((x) => {
      Object.keys(x).forEach((attr) => {
        if ('N' in x[attr]) x[attr] = parseFloat(x[attr].N);
        else if ('S' in x[attr]) x[attr] = x[attr].S;
        else x[attr] = x[attr][Object.keys(x[attr])[0]];
      });
      return x;
    });

    console.log('items', items)

    return {
      statusCode: 200,
      isBase64Encoded: false,
      headers,
      body: JSON.stringify({
        message: 'Hello from Lambda',
        input: payload,
        result: items
      }),
    }
  } catch (err) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        err: err?.message ?? err
      })
    };
  }

}

const createDocument = async (payload, context, callback) => {
  try {
    const dynamodb = connectDynamoDB();
    const params = {
      TableName: DYNAMODB_TABLE,
      Item: {
        id: {
          S: shortUid()
        },
        timestamp: {
          N: '' + Date.now()
        },
        title: {
          S: 'Some title'
        }
      }
    };
    await dynamodb.putItem(params).promise();

    const body = JSON.stringify({
      status: 'OK'
    });
    return {
      statusCode: 200,
      headers,
      body
    };
  } catch (err) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        err: err?.message ?? err
      })
    };
  }

}

const createTable = async (payload, context, callback) => {
  try {
    const dynamodb = connectDynamoDB();
    var params = {
      AttributeDefinitions: [
        {
          AttributeName: 'id',
          AttributeType: 'S'
        },
        // {
        //   AttributeName: 'timestamp',
        //   AttributeType: 'N'
        // },
        // {
        //   AttributeName: 'title',
        //   AttributeType: 'S'
        // }
      ],
      KeySchema: [
        {
          AttributeName: 'id',
          KeyType: 'HASH'
        }
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 1,
        WriteCapacityUnits: 1
      },
      TableName: DYNAMODB_TABLE,
      StreamSpecification: {
        StreamEnabled: false
      }
    };

    await dynamodb.createTable(params).promise();

    const body = JSON.stringify({
      status: 'OK'
    });
    return {
      statusCode: 200,
      headers,
      body
    };
  } catch (err) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        err: err?.message ?? err
      })
    };
  }

}

const createBucket = async (payload, context, callback) => {
  try {
    var bucketParams = {
      Bucket: 'documents',
      // CreateBucketConfiguration: {
      //   LocationConstraint: 'us-east-1'
      // }
    };

    const data = await s3.createBucket(bucketParams).promise();

    const body = JSON.stringify({
      status: 'OK',
      data
    });

    return {
      statusCode: 200,
      headers,
      body
    };
  } catch (err) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        err: err?.message ?? err,
      })
    };
  }

}

const uploadFile = async (payload, context, callback) => {
  try {
    var uploadParams = { Bucket: 'documents', Key: '', Body: '' };
    var file = './file_to_upload.txt';

    var fileStream = fs.createReadStream(file); // this file will come from client
    fileStream.on('error', function (err) {
      console.log('File Error', err);
    });
    uploadParams.Body = fileStream;
    var path = require('path');
    uploadParams.Key = path.basename(file);

    const data = await s3.upload(uploadParams).promise();

    const body = JSON.stringify({
      status: 'OK',
      data
    });

    return {
      statusCode: 200,
      headers,
      body
    };
  } catch (err) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        err: err?.message ?? err,
      })
    };
  }

}

module.exports = {
  getDocuments,
  createDocument,
  createTable,
  createBucket,
  uploadFile
}