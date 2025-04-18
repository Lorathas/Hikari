import {test, expect, mock} from 'bun:test'
import {contains, format} from './newline'
import { ObjectId, type WithId } from 'mongodb'
import type { Thread } from '../../data/post'
import type { Board } from '../../data/board'

const thread: WithId<Thread> = {
    subject: '',
    posts: [],
    bumpedAt: new Date(),
    postBumpCount: 0,
    imageBumpCount: 0,
    id: 0,
    text: '',
    createdAt: new Date(),
    userIp: '',
    deleted: false,
    banned: false,
    _id: new ObjectId()
}

const board: WithId<Board> = {
    _id: new ObjectId(),
    slug: '',
    name: '',
    description: '',
    lastPostId: 0,
    isPublic: true,
    config: {
        pages: {
            size: 0,
            limit: 0
        },
        fileSizes: {
            image: 0,
            video: 0
        },
        userCooldowns: {
            threads: 0,
            posts: 0,
            images: 0
        },
        bump: {
            posts: 0,
            threads: 0
        },
        query: {
            boardReply: 0
        }
    }
}

test('contains', () => {
    expect(contains('skfow keoefl kfg\r')).toBeFalse()
    expect(contains('skfow keoefl kfg\r\n')).toBeFalse()
    expect(contains('skfow keoefl kfg\n')).toBeFalse()

    expect(contains('\r')).toBeTrue()
    expect(contains('\r\n')).toBeTrue()
    expect(contains('\n')).toBeTrue()
    expect(contains('  \n')).toBeTrue()
    expect(contains('  \n  ')).toBeTrue()
    expect(contains('  \r\n  ')).toBeTrue()
    expect(contains('  \r  ')).toBeTrue()
    expect(contains('\r  ')).toBeTrue()
})

test('format', async () => {
    
    await expect(format(thread, board, 'skfow keoefl kfg\r')).rejects.toThrowError('Token contains non-whitespace characters')
    await expect(format(thread, board, 'skfow keoefl kfg')).rejects.toThrowError('Token contains non-whitespace characters')
    await expect(format(thread, board, 'skfow keoefl\r\nkfg')).rejects.toThrowError('Token contains non-whitespace characters')

    expect(await format(thread, board, '\r\n')).toStrictEqual({safe: true, text: '<br/>'})
    expect(await format(thread, board, '  \r\n')).toStrictEqual({safe: true, text: '  <br/>'})
    expect(await format(thread, board, '  \n')).toStrictEqual({safe: true, text: '  <br/>'})
    expect(await format(thread, board, '  \r')).toStrictEqual({safe: true, text: '  <br/>'})
    expect(await format(thread, board, '  \r  ')).toStrictEqual({safe: true, text: '  <br/>  '})
    expect(await format(thread, board, '  \r\n  ')).toStrictEqual({safe: true, text: '  <br/>  '})
    expect(await format(thread, board, '  \n  ')).toStrictEqual({safe: true, text: '  <br/>  '})
    expect(await format(thread, board, '  \r\n\n  ')).toStrictEqual({safe: true, text: '  <br/><br/>  '})
})