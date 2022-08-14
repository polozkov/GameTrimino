var PAIR = PAIR;
var STAT = STAT;
var RULE = RULE;
var AI = AI;
var DRAW = DRAW;
var AREA = AREA;
var PRESS = PRESS;
var SHOW = SHOW;
var window = window;

var ANIMATE = {
    //вспомогательные объекты для расчёта анимации
    CALC: {
        //верни объект с 3 досками (процесс) + ход + кто играет
        f_3_boards: function (board_from, board_to, fig, who) {
            'use strict';
            var m = RULE.MOVE.f_from_a_to_b(board_from, board_to, fig),
                b = RULE.MOVE.f_with_trimino(board_from, m),
                n_12 = (RULE.IS.f_same_boards(b, board_to) ? 1 : 2),
                abc = []; //массив из 1 или 2 пар досок 

            abc.push([board_from, b]); //тримино ставится всегда
            if (n_12 === 2) { //если есть взятие, то анимируй также удаление рядов
                abc.push([b, board_to]);
            }

            return {
                steps: abc, //массив: начало -> тримино, (если взятие тримино -> ряды)
                n12: n_12, //сколько шагов: 1 или 2 (со взятием)
                a: board_from,
                b: b,
                c: board_to,
                m: m,
                who: who
            };
        }
    },

    ANIM: {
        //покажи тримино и доступные ходы после анимации
        f_show_after_animation: function (GAME) {
            'use strict';
            SHOW.PANEL.f_elements_with_new_trimino(GAME);
            SHOW.MOVE.f_free_moves_by_game(GAME);
        },

        //анимация с таймером
        f_animate_calculated: function (GAME, STEPS, n_sub_steps, n_steps) {
            'use strict';
            //debugger;
            var i, i_move, i_step, STEP_NOW,
                board_a, board_b,
                press_bool, press_real,
                time_start = window.performance.now(),
                
                my_interval = window.setInterval( //таймер
                    function () {
                        var time_now = window.performance.now() - time_start,
                            //время, измеренное числом интервалов (нецелое)
                            time_real = time_now /  STAT.TIME.move,
                            //целая часть времени (номер интервала от 0)
                            time_n = Math.floor(time_real),
                            //дробная часть времени
                            time_01 = time_real - time_n;
                        
                        i_move = 0;
                        i_step = 0;
                        //повторяй time_n раз
                        for (i = 1; i <= time_n; i += 1) {
                            //i_step ноль, n12 два
                            if ((i_step === 0) && (STEPS[i_move].n12 === 2)) {
                                i_step += 1;
                            } else {
                                i_step = 0;
                                i_move += 1;
                            }
                        }
                        
                        STEP_NOW = STEPS[i_move];
                        
                        if ((time_n + 1) > n_sub_steps) {
                            //покажи законченную доску
                            SHOW.CELL.f_grid_by_matrix(STEPS[n_steps - 1].c);

                            //покажи панель и доступные ходы после анимации
                            ANIMATE.ANIM.f_show_after_animation(GAME);
                            SHOW.MOVE.f_one_move(STEP_NOW.who, STEP_NOW.m);
                            window.clearInterval(my_interval);
                            return;
                        }
                        
                        board_a = STEP_NOW.steps[i_step][0];
                        board_b = STEP_NOW.steps[i_step][1];
                        
                        if (i_step === 0) { //тихий ход
                            press_bool = PRESS.f_bool_difference(board_a, board_b);
                            press_real = PRESS.f_bool_to_xy(press_bool, time_01);
                            SHOW.CELL.f_grid_by_matrix(board_b, press_real);
                        } else {
                            press_bool = PRESS.f_food_rows(board_a);
                            press_real = PRESS.f_bool_to_xy(press_bool, 1 - time_01);
                            SHOW.CELL.f_grid_by_matrix(board_a, press_real);
                        }
                        
                        SHOW.MOVE.f_one_move(STEP_NOW.who, STEP_NOW.m);
                    },
                    STAT.TIME.step
                );
        },

        //в данной игре анимируй столько последних ходов (n = 1..2)
        f_total: function (GAME, n) {
            'use strict';
            var i_loop, i,
                steps_total = 0,
                all_moves = [];

            for (i_loop = n; i_loop > 0; i_loop -= 1) {
                i = GAME.move_number - i_loop;
                all_moves.push(ANIMATE.CALC.f_3_boards(
                    GAME.ARR[i].board, //предыдущая позиция
                    GAME.ARR[i + 1].board, //текущая позиция
                    GAME.ARR[i].fig, //фигура между двумя позициями
                    RULE.WHO.f_who_by_n(i) //кто делает ход
                ));
                i = all_moves.length - 1; //номер последнего хода
                steps_total += all_moves[i].n12; //столько всего шагов 
            }
            ANIMATE.ANIM.f_animate_calculated(GAME, all_moves, steps_total, n);
        }
    }
};
