var PAIR = PAIR;
var STAT = STAT;
var RULE = RULE;
var AI = AI;
var DRAW = DRAW;
var AREA = AREA;
var PRESS = PRESS;
var SHOW = SHOW;
var ANIMATE = ANIMATE;
var main_canvas = main_canvas;
var window = window;

var EVENT = {
    //массив позиций, фигур + режим игры и номер хода + интервал задержки
    GAME: {
        //массив досок и массив выпадающих фигур
        ARR: [],

        //режим игры: 0 - пасьянс, 1 - с другом, 2,3 - с компьютером
        mode: 0,

        //номер хода (начиная с нуля) = число показанных позиций
        move_number: 0
    },

    //вспомогательные функции без работы с мышью
    FUNC: {
        //установи пустую начальную позицию (для новой игры)
        f_set_start_position: function () {
            'use strict';
            EVENT.GAME.move_number = 0;
            EVENT.GAME.ARR = [];
            EVENT.GAME.ARR.push(AI.COMBO.f_game_record_empty());
        },

        //перерисуй текущую ситуацию под размер окна
        f_resize_and_renew: function () {
            'use strict';
            SHOW.PANEL.f_window_resize(EVENT.GAME);
            
            var board_now = EVENT.GAME.ARR[EVENT.GAME.move_number].board.slice();
            //полнстью законченная анимация
            SHOW.CELL.f_grid_by_matrix(board_now);
            
            ANIMATE.ANIM.f_show_after_animation(EVENT.GAME);
        },
        
        //делает полученный ход, удлинняя массивы и увиличивая счётчик
        f_play_board: function (new_board) {
            'use strict';
            EVENT.GAME.ARR.push(AI.COMBO.f_game_record_create(
                new_board.slice(),
                RULE.RANDOM.f_random_by_mode(new_board, EVENT.GAME.mode)
            ));
            EVENT.GAME.move_number += 1;
        }
    },

    //анимация и вспомогательные функции для обработки мыши
    OUT: {
        //нажата ячейка с данными координатами
        f_pressed: function (nx, ny) {
            'use strict';
            var game_over, new_board,
                LAST = EVENT.GAME.ARR[EVENT.GAME.move_number],
                m = RULE.MOVE.f_create(nx, ny, LAST.fig);
            
            //ход невозможен, ничего не делай
            if (!RULE.IS.f_move_legal(LAST.board, m.n_x, m.n_y, m.n_fig)) {
                return;
            }
            
            //СТЕРЕТЬ все ходы после максимального, исключив ошибки перемотки
            if (EVENT.GAME.ARR.length > (EVENT.GAME.move_number + 1)) {
                EVENT.GAME.ARR.length = EVENT.GAME.move_number + 1;
            }
            
            //сделан ход из последней позиции
            new_board = RULE.MOVE.f_return_copy(LAST.board.slice(), m);
            
            //сыграй новую позицию
            EVENT.FUNC.f_play_board(new_board.slice());
            
            //после сыгранности получи копию
            LAST = EVENT.GAME.ARR[EVENT.GAME.move_number];

            //работай с концом игры
            game_over = RULE.IS.f_game_over_total(LAST.board);
            
            //ходит компьютер и игра не закончена
            if ((EVENT.GAME.mode >= 2) && !game_over) {
                new_board = AI.BEST.f_mode(LAST.board, LAST.fig, EVENT.GAME.mode);
                EVENT.FUNC.f_play_board(new_board.slice());
                ANIMATE.ANIM.f_total(EVENT.GAME, 2); //анимируй 2 хода
            } else {ANIMATE.ANIM.f_total(EVENT.GAME, 1); }
        },

        //установи режим игры от 0 до 3
        f_set_mode_03: function (n_03) {
            'use strict';
            //надо перебросить кубик
            function need_roll_dice_again(last) {
                var was_solitaire = (EVENT.GAME.mode === 0), //был пасьянс
                    
                    //этой фигуры нет...
                    no_this_fig = RULE.IS.f_game_over_fig(last.board, last.fig),
                    //но есть другая фигура
                    is_smth_fig = !RULE.IS.f_game_over_total(last.board);

                return (was_solitaire && no_this_fig && is_smth_fig);
            }

            if (EVENT.GAME.mode === n_03) {
                return; //ничего не изменилось: тот же режим игры
            }

            //надо перебросить кубик
            var last = EVENT.GAME.ARR[EVENT.GAME.move_number];
            if (need_roll_dice_again(last)) {
                EVENT.GAME.ARR[EVENT.GAME.move_number].fig =
                    RULE.RANDOM.f_legal_fig(last.board);
            }
            
            EVENT.GAME.mode = n_03; //новый режим игры
            ANIMATE.ANIM.f_show_after_animation(EVENT.GAME);
        }
    },

    //событие - основная функция обработки щелчка мыши (координаты х,у)
    f_main_click: function (x, y) {
        'use strict';
        var ix, iy, i,
            arr_areas = [
                //области на панелях: 4 режима игры
                PAIR.GRID.f_row_in_column(AREA.GRID.game_mode, 4, 0),
                PAIR.GRID.f_row_in_column(AREA.GRID.game_mode, 4, 1),
                PAIR.GRID.f_row_in_column(AREA.GRID.game_mode, 4, 2),
                PAIR.GRID.f_row_in_column(AREA.GRID.game_mode, 4, 3),
                //ход назад, ход вперёд, новая игра
                AREA.GRID.move_back,
                AREA.GRID.move_forward,
                AREA.GRID.new_game,
                //вынуди ход компа
                AREA.GRID.copm_go
            ],
            arr_functions = [
                //функции управления соответствует массиву областей: 4 режима игры
                function () {EVENT.OUT.f_set_mode_03(0); },
                function () {EVENT.OUT.f_set_mode_03(1); },
                function () {EVENT.OUT.f_set_mode_03(2); },
                function () {EVENT.OUT.f_set_mode_03(3); },
                //на панели нажата кнопка "ХОД НАЗАД"
                function () {
                    if (EVENT.GAME.move_number > 0) {
                        EVENT.GAME.move_number -= 1;
                        EVENT.FUNC.f_resize_and_renew(undefined);
                    }
                },
                //на панели нажата кнопка "ХОД ВПЕРЁД"
                function () {
                    if (EVENT.GAME.move_number < (EVENT.GAME.ARR.length - 1)) {
                        EVENT.GAME.move_number += 1;
                        EVENT.FUNC.f_resize_and_renew(undefined);
                    }
                },
                //на панели нажата кнопка "НОВАЯ ИГРА"
                function () {
                    EVENT.FUNC.f_set_start_position();
                    EVENT.FUNC.f_resize_and_renew(undefined);
                },
                //на панели нажата кнопка, вынуждающая ход компа "ходи"
                function () {}
            ];

        for (i = 0; i < arr_areas.length; i += 1) {
            if (PAIR.BELONG.f_ab(arr_areas[i], x, y)) {
                arr_functions[i]();
                return;
            }
        }

        for (ix = 0; ix < STAT.C.N; ix += 1) {
            for (iy = 0; iy < STAT.C.N; iy += 1) {
                if (PAIR.BELONG.f_ab(AREA.GET_CELL.f_100(ix, iy), x, y)) {
                    EVENT.OUT.f_pressed(ix, iy);
                    return;
                }
            }
        }
    },

    //установи все события по привязке к главному холсту
    f_set_all_events: function () {
        'use strict';
        EVENT.FUNC.f_set_start_position();

        EVENT.FUNC.f_resize_and_renew();
        
        //изменение размеров окна, или смена ориентации экрана
        window.onresize = function () {
            EVENT.FUNC.f_resize_and_renew(undefined);
        };

        //щелчок мышью на канву
        main_canvas.onclick = function (e) {
            EVENT.f_main_click(e.clientX, e.clientY);
        };
    }
};
