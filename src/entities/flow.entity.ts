import { Entity, PrimaryGeneratedColumn, BaseEntity, CreateDateColumn, Column, JoinColumn, ManyToOne, UpdateDateColumn } from 'typeorm'


@Entity('flows')
export class Flow extends BaseEntity {
    @PrimaryGeneratedColumn('uuid', { name: 'flow_id' })
    readonly flowId!: string
    
    @Column('uuid', { name: 'user_id' })
    userId: string

    @Column('varchar', { name: 'name' })
    name: string

    @Column('jsonb', { name: 'nodes' })
    nodes: any

    @CreateDateColumn({ type: 'timestamptz', name: 'created_at', default: () => 'CURRENT_TIMESTAMP' })
    readonly createdAt: Date

    @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at', default: () => 'CURRENT_TIMESTAMP' })
    readonly updatedAt: Date
}