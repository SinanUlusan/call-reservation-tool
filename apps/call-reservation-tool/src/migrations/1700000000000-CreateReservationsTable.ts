import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateReservationsTable1700000000000
  implements MigrationInterface
{
  name = 'CreateReservationsTable1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'reservations',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            isPrimary: true,
            length: '36',
          },
          {
            name: 'startTime',
            type: 'varchar',
            length: '5',
          },
          {
            name: 'endTime',
            type: 'varchar',
            length: '5',
          },
          {
            name: 'email',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'phone',
            type: 'varchar',
            length: '20',
          },
          {
            name: 'pushNotificationKey',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'receiveEmail',
            type: 'boolean',
            default: false,
          },
          {
            name: 'receiveSmsNotification',
            type: 'boolean',
            default: false,
          },
          {
            name: 'receivePushNotification',
            type: 'boolean',
            default: false,
          },
          {
            name: 'status',
            type: 'varchar',
            length: '20',
            default: "'QUEUED'",
          },
          {
            name: 'reservationDate',
            type: 'date',
          },
          {
            name: 'createdTime',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedTime',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
        indices: [
          {
            name: 'IDX_RESERVATION_DATE',
            columnNames: ['reservationDate'],
          },
          {
            name: 'IDX_RESERVATION_STATUS',
            columnNames: ['status'],
          },
          {
            name: 'IDX_RESERVATION_EMAIL',
            columnNames: ['email'],
          },
        ],
      }),
      true
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('reservations');
  }
}
