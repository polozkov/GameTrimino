var PAIR = PAIR;
var RULE = RULE;
var STAT = STAT;

var AI = {
    //основные функции для работы с AI для поиска лучшего хода
    BASIS: {
        //лучший массив позиций на глубине 1 (съешь как можно больше)
        f_arr_depth_1: function (get_board, fig) {
            'use strict';
            var //массив из всех следующих позиций
                total_arr = RULE.BOARD.f_next_positions(get_board, fig),
                ///длина массива из всех позиций
                total_len = total_arr.length,
                //массив самых перспективных позиций
                best_arr = [],
                //каков лучший результат по пустым полям? (перспективы)
                best_now,
                //текущий результат для каждой интерации цикла
                i_value,
                i;

            if (total_len === 0) {
                return [];
            }

            //первая позиция
            best_arr.push(total_arr[0].slice());
            //первый результат (пока он лучший, так как единственный)
            best_now = RULE.BOARD.f_empty_amount(total_arr[0]);

            //цикл с 1, нулевая позиция записана
            for (i = 1; i < total_len; i += 1) {
                //текущий результат
                i_value = RULE.BOARD.f_empty_amount(total_arr[i]);

                //такая же перспективная позиция
                if (i_value === best_now) {
                    best_arr.push(total_arr[i].slice());
                } else if (i_value > best_now) {
                    //пустых полей больше -> ещё перспективней
                    //обнови лучший результат
                    best_now = i_value;
                    //старые позиции уже не перспективны
                    best_arr = [];
                    //первая перспективная
                    best_arr.push(total_arr[i].slice());
                }
            }

            return best_arr;
        },

        //НЕ КОНЕЦ ИГРЫ, сколько пустых клеток после лучшего хода фигуры?
        f_best_empty_amount: function (get_board, fig) {
            'use strict';
            var //самые перспективные позиции
                arr_best = AI.BASIS.f_arr_depth_1(get_board, fig);
            //все позиции одинаково перспективны, верни число пустых клеток
            return RULE.BOARD.f_empty_amount(arr_best[0]);
        },

        //среднее съедание при равномерном выпадении ВЫСТАВЛЯЕМЫХ фигур
        f_average_eating: function (get_board, is_duel) {
            'use strict';
            var //сколько было пустых клеток до хода
                n_empty_was = RULE.BOARD.f_empty_amount(get_board),
                //сумма съеденного для кождого тримино
                value_sum = 0,
                //сколько разных тримино можно ВЫСТАВЛЯТЬ (для них есть место)
                n_legal_figures = STAT.C.TRIM_N,
                i;

            for (i = STAT.C.TRIM_N - 1; i >= 0; i -= 1) {
                //конец игры для рассматриваемой фигуры в цикле
                if (RULE.IS.f_game_over_fig(get_board, i)) {
                    //доступных фигур будет на 1 меньше
                    n_legal_figures -= 1;
                } else {
                    //столько пустых полей после лучшего хода 
                    value_sum += AI.BASIS.f_best_empty_amount(get_board, i);
                    //сколько съели этой фигурой (разность пустых)
                    value_sum -= n_empty_was;
                }
            }

            if (n_legal_figures === 0) { //если нет ни одного хода
                return 0; //то съесть ничего не сможешь
            }

            //во время пасьянса считай все фигуры
            if (!is_duel) {
                n_legal_figures = STAT.C.TRIM_N;
            }

            //ешь столько в среднем на 1 фигуру
            return (value_sum / n_legal_figures);
        },

        //игра не закончена, глубина 2: лучшие позиции
        f_arr_depth_2: function (get_board, fig, is_duel) {
            'use strict';
            var //перспективные позиции с лучшим первым ходом
                look_boards = AI.BASIS.f_arr_depth_1(get_board, fig),
                //сколько перспективных позиций?
                look_n = look_boards.length,

                best_now, //лучший результат
                best_arr = [], //массив лучших позиций
                i_value_now, //текущий результат
                i;

            //начни с позиции номер 0, она точно существует
            best_arr.push(look_boards[0]);
            //с этой переменной будем сравнивать лучшие результаты
            best_now = AI.BASIS.f_average_eating(look_boards[0]);

            for (i = 1; i < look_n; i += 1) {
                //текущий результат
                i_value_now = AI.BASIS.f_average_eating(look_boards[i]);

                //такая же перспективная позиция
                if (i_value_now === best_now) {
                    best_arr.push(look_boards[i].slice());
                } else if ((i_value_now < best_now) === is_duel) {
                    //во время дуэли старайся, чтобы i_value_now ...
                    //... было минимальным, при ПАСЬЯНСЕ - наоборот
                    best_now = i_value_now;
                    //обнови лучший результат
                    best_arr = [];
                    //старые позиции уже не перспективны
                    //первая и единственная перспективная
                    best_arr.push(look_boards[i].slice());
                }
            }
            //массив лучших позиций на глубине 2
            return (best_arr);
        }
    },

    //функции, возвращающие лучший ход и лучшую позицию
    BEST: {
        //игра не закончена: лучшая следующая позиция
        f_parametrs: function (get_board, fig, is_duel, is_deep) {
            'use strict';
            //во время ДУЭЛИ смотри на глубину 2 или 1
            if (is_duel) {
                //смотри глубоко, это дуэль, а не пасьянс
                if (is_deep) {
                    return (AI.BASIS.f_arr_depth_2(get_board, fig, true));
                } else {
                    //на глубине 1 верни случайную лучшую позицию
                    return (AI.BASIS.f_arr_depth_1(get_board, fig));
                }
            } else { //пасьянс компьютер играет всегда сильно (на глубине 2)
                return (AI.BASIS.f_arr_depth_2(get_board, fig, false));
            }
        },

        //лучшая позиция: режимы игры: 0 - пасьянс, 1..2 - слабый, 3 - сильный
        f_mode: function (get_board, fig, game_mode) {
            'use strict';
            var //массив лучших позиции
                best = [],
                //масиив для 4 режимов, номера 1,2 ИДЕНТИЧНЫ
                bool_03 = [
                    [false, true], //пасьянс
                    [true, false], //слабо (вынуждает ход при игре с другом)
                    [true, false], //слабо (компьютер играет сам)
                    [true, true] //сильно
                ],
                b_01 = bool_03[game_mode];

            //лучшие позиции для данного режима 
            best = AI.BEST.f_parametrs(get_board, fig, b_01[0], b_01[1]);
            //случайная копия одной из лучших позиций
            return (best[STAT.F.f_random_number(best.length)].slice());
        }
    },

    //объединение доски и хода в запись
    COMBO: {
        //тип игры запись как в Паскале: позиция и фигура
        f_game_record_create: function (get_board, fig) {
            'use strict';
            return {
                board: get_board.slice(),
                fig: fig
            };
        },

        //запись: начальная (пустая) доска и случайная фигура
        f_game_record_empty: function () {
            'use strict';
            return {
                board: RULE.BOARD.f_return_empty(),
                fig: STAT.F.f_random_fig()
            };
        }
    }
};
