var STAT = STAT,
    PAIR = PAIR,
    RULE = RULE;

//вычисление объекта настроек для анимации
var PRESS = {
    //возвращает поле, заполненное одним значением (x: 1, y: 1)
    f_xy_11: function () {
        'use strict';
        var i, out_arr = [];

        out_arr.length = STAT.C.SQ;

        for (i = 0; i < STAT.C.SQ; i += 1) {
            out_arr[i] = PAIR.CREATE.f_xy(1, 1);
        }

        return out_arr;
    },

    //из булева сжатия  ху (сжать или нет) делай пару чисел (на столько ху) 
    f_bool_to_xy: function (bool_board, press_01) {
        'use strict';
        var i, out_arr = [];

        out_arr.length = STAT.C.SQ;

        for (i = 0; i < STAT.C.SQ; i += 1) {
            out_arr[i] = PAIR.CREATE.f_xy(
                bool_board[i].x ? press_01 : 1,
                bool_board[i].y ? press_01 : 1
            );
        }

        return (out_arr);
    },

    //БУЛЕВО сжатия ПО РЯДАМ (из поля с поставленной фигурой)
    f_food_rows: function (board_plus_fig) {
        'use strict';
        var ix, iy, out_arr = [],
            rows = RULE.CELL.f_rows(board_plus_fig);

        out_arr.length = STAT.C.SQ; //длина итогового массива

        for (ix = 0; ix < STAT.C.N; ix += 1) {
            for (iy = 0; iy < STAT.C.N; iy += 1) {
                RULE.CELL.f_set( //установи в наш массив
                    out_arr,
                    ix,
                    iy,
                    PAIR.CREATE.f_xy( //булевы значение сжатия
                        rows.vert[ix],
                        rows.hori[iy]
                    )
                );
            }
        }

        return (out_arr);
    },
    
    //несовпадающие ячейки (YES,YES), совпадающие (NO,NO)
    f_bool_difference: function (board_a, board_b) {
        'use strict';
        var i, is_same, out_arr = [];
        
        out_arr.length = STAT.C.SQ;
        
        for (i = 0; i < STAT.C.SQ; i += 1) {
            is_same = (board_a[i] === board_b[i]); //ячейки равны
            out_arr[i] = is_same ? STAT.C.P_NO_NO : STAT.C.P_YES_YES;
        } 
        
        return out_arr;
    },

    //возвращает поле со сжатыми 3 клетками с тримино из данного хода
    f_trimino: function (m) {
        'use strict';
        var i, ix, iy,
            out_arr = [], //изначально всё разжато
            t = STAT.C.ARR_TRIMINO[m.n_fig]; //сама фигура тримино

        out_arr.length = STAT.C.SQ; //длина массива = число клеток поля

        for (i = 0; i < STAT.C.SQ; i += 1) {
            out_arr[i] = STAT.C.P_NO_NO; //не сжимать (ложь, ложь)
        }

        //пройди все сжимаемые клетки тримино
        for (i = t.length - 1; i >= 0; i -= 1) {
            ix = m.n_x + t[i].x;
            iy = m.n_y + t[i].y;
            //булев значение (истина, истина: тримино сжимать равномерно)
            RULE.CELL.f_set(out_arr, ix, iy, STAT.C.P_YES_YES);
        }

        return out_arr;
    }
};
