/**
 * Task type
 */
export enum WorkerTaskType {
    GET_FILE = 'get-file',
    ADD_FILE = 'add-file',
    SEND_HEDERA = 'send-hedera',
    GENERATE_DEMO_KEY = 'generate-demo-key',
    GET_USER_BALANCE = 'get-user-balance',
    GET_ACCOUNT_INFO = 'get-account-info',
    CREATE_TOKEN = 'create-token',
    NEW_TOKEN = 'new-token',
    ASSOCIATE_TOKEN = 'associate-token',
    GRANT_KYC_TOKEN = 'grant-kyc-token',
    FREEZE_TOKEN = 'freeze-token',
    MINT_TOKEN = 'mint-token',
    WIPE_TOKEN = 'wipe-token',
    NEW_TOPIC = 'new-topic',
    CHECK_ACCOUNT = 'check-account',
    GET_TOPIC_MESSAGE = 'get-topic-message',
    GET_TOPIC_MESSAGES = 'get-topic-messages'
}

/**
 * Worker Request
 */
export interface IWorkerRequest {
    /**
     * Minimum priority
     */
    minPriority: number;

    /**
     * Maximum priority
     */
    maxPriority: number;

    /**
     * Task timeout
     */
    taskTimeout: number;
}

/**
 * Task interface
 */
export interface ITask {
    /**
     * Task ID
     */
    id?: string;

    /**
     * Task priority
     */
    priority?: number;

    /**
     * Task type
     */
    type: WorkerTaskType;

    /**
     * Task data
     */
    data: any;

}

/**
 * Task result
 */
export interface ITaskResult {
    /**
     * Task ID
     */
    id: string;
    /**
     * Result data
     */
    data?: any;
    /**
     * Task error
     */
    error?: any;
}

/**
 * Active task interface
 */
export interface IActiveTask {
    /**
     * Task
     */
    task: ITask;
    /**
     * Number of repetitions
     */
    number: number;
    /**
     * Ready callback
     * @param data
     */
    callback: (data: any, error: any) => void;
}
