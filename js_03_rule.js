var PAIR = PAIR,
    STAT = STAT,
    window = window;

//правила для работы с позицией (ходы)
var RULE = {
    //примитивы для 1 ячейки и поска полных рядов
    CELL: {
        //получи значение ячейки по координатам
        f_get: function (get_board, x, y) {
            'use strict';
            return get_board[x + y * STAT.C.N];
        },

        //установи в ячейку новое значение
        f_set: function (get_board, x, y, new_value) {
            'use strict';
            get_board[x + y * STAT.C.N] = new_value;
        },

        //в даном массиве ячейка свободна (пуста, то есть 0)
        f_is_empty: function (get_board, x, y) {
            'use strict';
            return (RULE.CELL.f_get(get_board, x, y) === 0);
        },

        //в данном массиве ячейка занята (не свободна, не ноль)
        f_is_occupied: function (get_board, x, y) {
            'use strict';
            return (RULE.CELL.f_get(get_board, x, y) !== 0);
        },

        //ДВА булевых массива: vert, hori (какие ряды заполнены)
        f_rows: function (get_board) {
            'use strict';
            var i, ix, iy,
                vert = [],
                hori = [];
            //ищем полностью заполненные ряды
            for (i = 0; i < STAT.C.N; i += 1) {

                //проверь горизонталь: координату "Х"
                hori[i] = true;
                for (ix = 0; ix < STAT.C.N; ix += 1) {
                    if (RULE.CELL.f_is_empty(get_board, ix, i)) {
                        hori[i] = false;
                    }
                }

                //проверь вертикаль: координату "У"
                vert[i] = true;
                for (iy = 0; iy < STAT.C.N; iy += 1) {
                    if (RULE.CELL.f_is_empty(get_board, i, iy)) {
                        vert[i] = false;
                    }
                }
            }

            //верни оба массива
            return ({
                vert: vert,
                hori: hori
            });
        }
    },

    //true,false функции (в том числа конец игры)
    IS: {
        //находится ли ячейка на поле? (не выходит ли за границу?)
        f_on_board: function (nx, ny) {
            'use strict';
            return (
                (0 <= nx) && (nx < STAT.C.N) &&
                (0 <= ny) && (ny < STAT.C.N)
            );
        },

        //возможен ли ход? доска + параметры хода: три числа
        f_move_legal: function (get_board, n_x, n_y, n_fig) {
            'use strict';
            var //само текущее тримино
                trimino = STAT.C.ARR_TRIMINO[n_fig],
                i, ix, iy;
            //проверь все ячйки фигуры
            for (i = trimino.length - 1; i >= 0; i -= 1) {
                //терущая рассматриваемая ячейка
                ix = trimino[i].x + n_x;
                iy = trimino[i].y + n_y;
                if (RULE.IS.f_on_board(ix, iy) === false) {
                    return false; //фигура выходит за границы поля
                }
                if (RULE.CELL.f_is_occupied(get_board, ix, iy)) {
                    return false; //клетка фигуры уже занятa
                }
            }
            return true; //все ячейки проверены: ход есть
        },

        //являются ли две доски идентичными ?
        f_same_boards: function (board_a, board_b) {
            'use strict';
            var i;
            //проверь все ячейки обеих квадратных досок
            for (i = 0; i < STAT.C.SQ; i += 1) {
                if (board_a[i] !== board_b[i]) {
                    return false;
                }
            }
            return true;
        },

        //игра закончена? (некуда ставить фигуру)
        f_game_over_fig: function (get_board, fig) {
            'use strict';
            var ix, iy;

            for (ix = STAT.C.N - 1; ix >= 0; ix -= 1) {
                for (iy = STAT.C.N - 1; iy >= 0; iy -= 1) {
                    //рассмотри ход в текущую клетку
                    //проверь, ход возможен?
                    if (RULE.IS.f_move_legal(get_board, ix, iy, fig)) {
                        return false; //ход есть, игра не закончена
                    }

                }
            }

            return true; //нет ни одного хода
        },

        //игра закончена? нет ни одной фигуры
        f_game_over_total: function (get_board) {
            'use strict';
            var i;
            //рассмотри все фигуры тримино
            for (i = STAT.C.TRIM_N - 1; i >= 0; i -= 1) {
                //игра НЕ ЗАКОНЧЕНА для данно фигуры (проверка)
                if (!RULE.IS.f_game_over_fig(get_board, i)) {
                    return false; //игра не закончена, не конец
                }
            }
            return true; //конец игры, нет ни одной свободной фигуры
        },
        
        //коне игры? в зависимости от режима (при пасьянсе и от фигуры)
        f_game_over_mode: function (get_board, fig, game_mode) {
            'use strict';
            if (game_mode === 0) {
                return RULE.IS.f_game_over_fig(get_board, fig);
            } else {
                return RULE.IS.f_game_over_total(get_board);
            }
        }
    },

    //части хода и сами ходы, ход "board_a" -> "board_b"
    MOVE: {
        //возвращает объект хода по всем его параметрам
        f_create: function (n_x, n_y, n_fig) {
            'use strict';
            return ({
                n_x: n_x,
                n_y: n_y,
                n_fig: n_fig
            });
        },
        
        //легален ли ход (параметр "ход" - единый объект)
        f_is_legal: function (get_board, m) {
            'use strict';
            return RULE.IS.f_move_legal(get_board, m.n_x, m.n_y, m.n_fig);
        },
        
        //добавь тримино игрока на доску, точка (0,0) фигуры в (n_x, n_y)
        f_add_trinino: function (get_board, n_x, n_y, fig) {
            'use strict';
            var i = STAT.C.ARR_TRIMINO[fig].length;

            for (i = i - 1; i >= 0; i -= 1) {
                RULE.CELL.f_set(
                    get_board,
                    STAT.C.ARR_TRIMINO[fig][i].x + n_x,
                    STAT.C.ARR_TRIMINO[fig][i].y + n_y,
                    1
                );
            }
        },
        
        //верни копию доски с добавоенным тримино во время хода m
        f_with_trimino: function (get_board, m) {
            'use strict';
            var new_board = get_board.slice();
            RULE.MOVE.f_add_trinino(new_board, m.n_x, m.n_y, m.n_fig);
            return new_board.slice();
        },

        //удали занятые ряды
        f_delete_rows: function (get_board) {
            'use strict';
            var i, ix, iy,
                //полностью заполненные ряды, которые надо удалить
                all_rows = RULE.CELL.f_rows(get_board);

            //все горизонтальные и вертикальные ряды на квадратной доске
            for (i = 0; i < STAT.C.N; i += 1) {

                //удали горизонтальный ряд
                if (all_rows.hori[i]) {
                    for (ix = 0; ix < STAT.C.N; ix += 1) {
                        RULE.CELL.f_set(get_board, ix, i, 0);
                    }
                }

                //удали вертикальный ряд
                if (all_rows.vert[i]) {
                    for (iy = 0; iy < STAT.C.N; iy += 1) {
                        RULE.CELL.f_set(get_board, i, iy, 0);
                    }
                }
            }
        },

        //делает один ход, меняя полученный массив, (ход возможен)
        f_do: function (get_board, get_move) {
            'use strict';
            //поставь тримино
            RULE.MOVE.f_add_trinino(
                get_board,
                get_move.n_x,
                get_move.n_y,
                get_move.n_fig
            );

            //удали полученные ряды
            RULE.MOVE.f_delete_rows(get_board);
        },

        //делает ход, не меняя исходный массив
        f_return_copy: function (get_board, get_move) {
            'use strict';
            var copy_board = get_board.slice();
            RULE.MOVE.f_do(copy_board, get_move);
            return copy_board;
        },

        //ход между двумя позициями board_a, board_b
        f_from_a_to_b: function (board_a, board_b, fig) {
            'use strict';
            var ix, iy, board_now, move_now;

            //пройдись по всем строкам и столбцам
            for (ix = STAT.C.N - 1; ix >= 0; ix -= 1) {
                for (iy = STAT.C.N - 1; iy >= 0; iy -= 1) {
                    //рассмотри ход на текущую клетку
                    move_now = RULE.MOVE.f_create(ix, iy, fig);

                    //ход легален?
                    if (RULE.MOVE.f_is_legal(board_a, move_now)) {
                        //работай с копией доски
                        board_now = board_a.slice();

                        //делай ход на копии доски
                        RULE.MOVE.f_do(board_now, move_now);

                        //получаем нужную позицию
                        if (RULE.IS.f_same_boards(board_now, board_b)) {
                            return move_now; //ход найден
                        }
                    } //конец условия легальости хода
                } //конец цикла iy
            } //конец цикла ix           
        }
    },
    
    //функиции, возвращающие матрицы досок
    BOARD: {
        //возвращает поле, заполненное нулями
        f_return_empty: function () {
            'use strict';
            var i, out_arr = [];

            out_arr.length = STAT.C.SQ;

            for (i = 0; i < STAT.C.SQ; i += 1) {
                out_arr[i] = 0;
            }

            return (out_arr);
        },
        
        //сколько ячеек на поле свободно?
        f_empty_amount: function (get_board) {
            'use strict';
            var i, amount = 0;
            //пройди все ячейки
            for (i = 0; i < STAT.C.SQ; i += 1) {
                if (get_board[i] === 0) {
                    amount += 1;
                }
            }
            return amount;
        },
        
        //сколько съедено (-3, если наоборот, фигура выставлена без еды)
        f_food_amount_ab: function (board_a, board_b) {
            'use strict';
            var food_a = RULE.BOARD.f_empty_amount(board_a),
                food_b = RULE.BOARD.f_empty_amount(board_b);
            return (food_b - food_a);
        },
    
        //ячейки, куда можно поставить фигуру (булева матрица)
        f_legal_cells: function (get_board, fig) {
            'use strict';
            var legal_arr = RULE.BOARD.f_return_empty(),
                ix,
                iy,
                move_now,
                is_ok;

            //пройдись по всем строкам и столбцам
            for (ix = STAT.C.N - 1; ix >= 0; ix -= 1) {
                for (iy = STAT.C.N - 1; iy >= 0; iy -= 1) {

                    //рассмотри ход на текущую клетку
                    move_now = RULE.MOVE.f_create(ix, iy, fig);

                    //ход возможен (истина или ложь?)
                    is_ok = RULE.MOVE.f_is_legal(get_board, move_now);

                    //логическое значение пишем в булев массив
                    RULE.CELL.f_set(legal_arr, ix, iy, is_ok);
                }
            }
            return legal_arr; //булева матрица с возможными ходами
        },

        //массив всех позиций, получаемые ходом фигуры
        f_next_positions: function (get_board, fig) {
            'use strict';
            var ix, iy,
                move_now, //рассматриваемый ход (легален или невозможен)
                board_now, //одна из возможных позиций
                arr_next = []; //массив получаемых позиций

            //пройдись по всем строкам и столбцам
            for (ix = STAT.C.N - 1; ix >= 0; ix -= 1) {
                for (iy = STAT.C.N - 1; iy >= 0; iy -= 1) {

                    //рассмотри ход на текущую клетку
                    move_now = RULE.MOVE.f_create(ix, iy, fig);

                    //ход легален?
                    if (RULE.MOVE.f_is_legal(get_board, move_now)) {
                        //копия доски
                        board_now = get_board.slice();
                        //ход с копией доски
                        RULE.MOVE.f_do(board_now, move_now);
                        //пополни массив легальных позиций
                        arr_next.push(board_now);
                    }
                }
            }
            return arr_next;
        }
    },
    
    //случайно сгенерированная фигура
    RANDOM: {
        //возвращает случайную фигуру, которой можно делать ход
        f_legal_fig: function (get_board) {
            'use strict';
            var i,
                //фигуры, которые можно выставлять на поле
                legal_arr = [];

            for (i = STAT.C.TRIM_N - 1; i >= 0; i -= 1) {
                if (!RULE.IS.f_game_over_fig(get_board, i)) {
                    //пополни массив легальных фигур
                    legal_arr.push(i);
                }
            }

            //нет ни одной легальной фигуры
            if (legal_arr.length === 0) {
                //выстави фигуру конца игры
                return STAT.C.TRIMINO_GAME_OVER;
            }

            //случайный элемента масива легальных фигур
            i = STAT.F.f_random_number(legal_arr.length);
            //сама случайная фигура
            return (legal_arr[i]);
        },

        //возвращает случайную фигуру (режим пасьянса или дуэли)
        f_random_by_mode: function (get_board, game_mode) {
            'use strict';
            if (game_mode === 0) { //режим пасьянса
                return STAT.F.f_random_fig();
            } else {
                //если игра закончена, вернёт фигуру конца игры
                return RULE.RANDOM.f_legal_fig(get_board);
            }
        }
    },
    
    WHO: {
        //кто сейчас ходит по номеру хода: нечётный: 1, четный: 2
        f_who_by_n: function (n) {
            'use strict';
            return (((n % 2) === 1) ? 1 : 2);
        },
        
        //кто сейчас ходит по длине массива: нечётный: 1, четный: 2
        f_who_by_arr: function (get_array) {
            'use strict';
            return RULE.WHO.f_who_by_n(get_array.length);
        },
        
        //верни оппонента
        f_opponent: function (who_now) {
            'use strict';
            return (3 - who_now);
        }
    }
};
