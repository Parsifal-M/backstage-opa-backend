import { getVoidLogger } from '@backstage/backend-common';
import express from 'express';
import request from 'supertest';
import axios from 'axios';
import { createRouter } from './router';
import { ConfigReader } from '@backstage/config';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('createRouter', () => {
  let app: express.Express;

  let config: ConfigReader;

  beforeAll(async () => {
    config = new ConfigReader({
      opaClient: {
        baseUrl: 'http://localhost', // replace with your actual URL or mock URL
        policies: {
          entityChecker: {
            package: 'entitymeta_policy',
          },
          rbac: {
            package: 'rbac_policy',
          },
        },
      },
    });

    const router = await createRouter({
      logger: getVoidLogger(),
      config: config,
    });

    app = express().use(router);
    jest.resetAllMocks();
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('POST /entity-checker', () => {
    it('returns data from OPA', async () => {
      const mockResponse = { data: { result: 'mockResult' } };
      mockedAxios.post.mockResolvedValue(mockResponse);

      config.getOptionalString('opaClient.baseUrl');

      const response = await request(app)
        .post('/entity-checker')
        .send({ input: 'entityMetadata' });

      expect(response.status).toEqual(200);
      expect(response.body).toEqual(mockResponse.data.result);
    });

    it('handles entity metadata route error', async () => {
      mockedAxios.post.mockRejectedValue(new Error());

      const response = await request(app)
        .post('/entity-checker')
        .send({ input: 'entityMetadata' });

      expect(response.status).toEqual(500); // Check the HTTP status code
      expect(response.body.message).toContain(
        `An error occurred trying to send entity metadata to OPA`,
      ); // Check the actual error message received
    });
  });

  describe('POST /opa-permissions', () => {
    it('returns 400 if OPA URL is not set or missing', async () => {
      const noBaseUrlConfig = new ConfigReader({
        opaClient: {
          policies: {
            entityChecker: {
              package: 'entitymeta_policy',
            },
            rbac: {
              package: 'rbac_policy',
            },
          },
        },
      });

      const router = await createRouter({
        logger: getVoidLogger(),
        config: noBaseUrlConfig,
      });

      const noBaseUrl = express().use(router);

      const response = await request(noBaseUrl)
        .post('/opa-permissions')
        .send({ input: 'policyInput' });

      expect(response.status).toEqual(400);
    });

    it('returns 400 if OPA RBAC package is not set or missing', async () => {
      const noRbacPackageConfig = new ConfigReader({
        opaClient: {
          baseUrl: 'http://localhost',
          policies: {
            entityChecker: {
              package: 'entitymeta_policy',
            },
          },
        },
      });

      const router = await createRouter({
        logger: getVoidLogger(),
        config: noRbacPackageConfig,
      });

      const noRbacPackage = express().use(router);

      const response = await request(noRbacPackage)
        .post('/opa-permissions')
        .send({ input: 'policyInput' });

      expect(response.status).toEqual(400);
      expect(response.body.message).toEqual(
        'OPA RBAC package not set or missing!',
      );
    });

    it('returns 400 if policy input is missing', async () => {
      const response = await request(app).post('/opa-permissions').send({});

      expect(response.status).toEqual(400);
      expect(response.body.message).toEqual('The policy input is missing!');
    });

    it('returns 500 if an error occurs when sending policy input to OPA', async () => {
    
      mockedAxios.post.mockRejectedValue(new Error());
      const response = await request(app)
        .post('/opa-permissions')
        .send({ policyInput: 'policydata' });
    
      expect(response.status).toEqual(500);
      expect(response.body.message).toEqual(
        'An error occurred trying to send policy input to OPA',
      );
    });
  });
});
