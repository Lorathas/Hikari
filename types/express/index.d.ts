import Board from "../../data/board";

declare namespace Express {
    interface Request {
        board?: Board
    }
    declare namespace Core {
        interface ParamsDictionary {
            board?: string
        }
    }
}